// deno-lint-ignore-file no-unused-vars
import prompts from "prompts";
import "@std/dotenv/load"; // can't call directly otherwise it doesn't work for some reason?
							// so we do this instead
import {SchoolLogin} from "./models/login.ts";
import moment from "moment";
import { Eta } from "@eta-dev/eta";
import {Timetable} from "./models/timetable.ts";
import {User} from "./models/user.ts";

if (import.meta.main) {
	let vars: { email: string; password: string };

	if(!Deno.env.get("EMAIL") || !Deno.env.get("PASS")) {
		console.log("No EMAIL or PASS env set.");
		vars = await prompts([
			{
				type: "text",
				name: "email",
				message: "Please enter your Arbor email (this is usually your school email):",
			},
			{
				type: "password",
				name: "password",
				message: "Please enter your Arbor password (it will be concealed):",
			}
		]);
	}
	else {
		vars = {
			email: Deno.env.get("EMAIL")!,
			password: Deno.env.get("PASS")!
		}
	}

	const loginResponse = await SchoolLogin.doLogin(vars.email, vars.password);
	const loginSession = loginResponse.session;
	console.log("Logged in!");

	console.log("Note that only the week commencing, from the start date, will be generated.");
	const now = moment();
	const start = await prompts(
		{
			type: "text",
			name: "startDate",
			message: "Please enter the start date (YYYY-MM-DD):",
			// this week's monday
			initial: now.clone().startOf("week").add(1, "day").format("YYYY-MM-DD"),
			format: (d: string) => moment(d, "YYYY-MM-DD").startOf("week").add(1, "day"),
		}
	);
	const end = start.startDate.clone().endOf("week").add(1, "day");
	console.log(`Generating timetable from ${start.startDate.format("Do MMM YYYY")} to ${end.format("Do MMM YYYY")}...`);

	// get user details
	const userDetails = await User.getUserDetails(loginSession);
	const deets = userDetails.items[0];
	console.log(`Hello, ${deets.display_name}!`)

	// get tt
	const timetable = await Timetable.getTimetable(loginSession, start.startDate.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
	console.log(`Fetched timetable! (${timetable.items.length} days with data)`);
	if (timetable.items.length > 2 && timetable.items.length < 5) {
		console.warn("Warning: Timetable has less than 5 days of data. You probably won't get a full week.");
	} else if (timetable.items.length < 2) {
		console.error("Error: Timetable has too little data for that date range. Exiting...");
		Deno.exit(1);
	}

	// render html template (eta)
	const eta = new Eta({ views: "./assets" });
	const rendered = await eta.renderAsync("template", { timetable, moment, school: loginResponse.school.name, student: deets.display_name, year: start.startDate.format("YYYY") });

	await Deno.mkdir("out", { recursive: true });
	await Deno.writeTextFile("out/timetable.html", rendered);

	// TODO: gen PDF
}