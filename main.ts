// deno-lint-ignore-file no-unused-vars
import prompts from "prompts";
import "@std/dotenv/load"; // can't call directly otherwise it doesn't work for some reason?
							// so we do this instead
import {SchoolLogin} from "./models/login.ts";
import moment from "moment";

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
	console.log("Logged in!");

	const now = moment();
	const start = await prompts(
		{
			type: "text",
			name: "startDate",
			message: "Please enter the start date (YYYY-MM-DD):",
			initial: now.set("day", 1).format("YYYY-MM-DD"), // first day of this month
			format: (d: string) => moment(d, "YYYY-MM-DD"),
		}
	);
	const end = await prompts(
		{
			type: "text",
			name: "endDate",
			message: "Please enter the end date (YYYY-MM-DD):",
			initial: now.set("day", now.daysInMonth()).format("YYYY-MM-DD"), // last day of this month
			validate: (d: string) =>  moment(d, "YYYY-MM-DD").isAfter(start) ? true : "End date must be after start date",
			format: (d: string) => moment(d, "YYYY-MM-DD"),
		}
	);

	console.log(`Generating timetable from ${start.startDate.format("Do MMM YYYY")} to ${end.endDate.format("Do MMM YYYY")}...`);

	// TODO: gen PDF
}