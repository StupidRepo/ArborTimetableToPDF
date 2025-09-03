// deno-lint-ignore-file no-namespace
// gonna write some funny comments for any arbor devs who are like:
// goofy arbor dev 4: "yo bro who tf is 'github.com/StupidRepo/ArborTimetableToPDF' and why is it making requests???"
// goofy arbor dev 4: "oh i just checked login.ts, this guy is making fun of us! let's send a ✨ cease and desist ✨ :D"
// me: "*sigh* i love lawyers :D"
import {API_BASE_URL, CLIENT_ID, LOGIN_URL, Networking} from "../consts.ts";

export namespace FirstAuthorization {
	// login.arbor.sc/oauth/authorize
	export interface Request {
		client_id: string;
		scope: "STUDENT";

		username: string;
		password: string;
	}

	export interface Response {
		code: string;
	}
}

export namespace SchoolAuthorization {
	// login.arbor.sc/oauth/token
	export interface School {
		sisApplicationId: string;

		name: string;
		shortName: string | null; // why did we switch from whatever_this_is to camelCase? 😂

		domain: string;
	}

	export interface Token {
		domain: string;
		refresh_token: string;
	}

	export interface Request {
		client_id: string;
		scope: "STUDENT";

		grant_type: "authorization_code";
		code: string;
	}

	export interface Response {
		schools: School[];
		tokens: Token[];
	}
}

// i have no idea why we need yet another bloody token.
// i am giving you my school email and password, then you want me to pick from a list of schools?
// brother, a-student@some.school will not be in a hundred different schools. 🥹
// oh also, hello again whatever_this_is!
export namespace SchoolLogin {
	// student-api.arbor.sc/oauth/token (needs sis-application-id header to identify school)
	// btw, a sis-application-hostname header is sent (by the student app) but is literally ignored by the API 😂 goofy API devs...
	export interface Request {
		client_id: string;

		grant_type: "refresh_token";
		refresh_token: string;
	}

	export interface Response {
		sisApplicationId: string; // lol you thought we were done with whatever_this_is?
		// goofy arbor dev 3: "nah bro lets just use the one from before,
		//  because it's there and we cba to type it out lmaooo
		//  *proceeds to copy n paste it*"

		token_type: "Bearer";
		scope: "STUDENT";

		access_token: string;
		refresh_token: string;
		session_id: string; // LMAO you thought we were using access_token for login?
		// nah bro, we just shove in mis=session_id in a cookie header and call it a day LMAOOOOOO
		// atp just remove the cookie header and put in Authorization: Bearer access_token
		//  or if you still want your dumbahh cookie header, just put in mis=access_token instead of session_id,
		//  and axe session_id
		// goofy ahh API design

		expires_in: number; // lol we don't need this tbh
		// we are simply in n out: get the token, use it immediately, and be off with it.
		// tbf we are literally just unnecessarily generating tokens for no reason. i love it :D
		// goofy arbor dev 1: "yo bro a-student@some.school keeps generating random tokens with client id 'github.com/StupidRepo/ArborTimetableToPDF', what do?"
		// goofy arbor dev 2: "how about we just allow the client to delete the token via some endpoint?"
		// goofy arbor dev 1: "nah that's just too much work, we are lazy remember?"
		// goofy arbor dev 2: "bruh that's so real tho! :)"
		// goofy arbor dev 1: "wanna grab some 🍕 and a 🍺 after work?"
		// goofy arbor dev 2: "bet! :D"
	}

	export async function doLogin(username: string, password: string) : Promise<{
		session: SchoolLogin.Response,
		school: SchoolAuthorization.School,
	}> {
		// 1. first authorisation
		console.log("Logging in...");
		const firstAuthRequest: FirstAuthorization.Request = {
			client_id: CLIENT_ID,
			scope: "STUDENT",
			username,
			password
		};

		const firstAuthResponse = await Networking.doNetworkRequest<FirstAuthorization.Response>(
			"POST",
			LOGIN_URL + "authorize?response_type=code&state=github.com/StupidRepo/ArborTimetableToPDF", // state can be anything, it's just returned back to us
			firstAuthRequest
		);

		// 2. school authorisation
		console.log("Getting school token...")
		const schoolAuthRequest: SchoolAuthorization.Request = {
			client_id: CLIENT_ID,
			scope: "STUDENT",
			grant_type: "authorization_code",
			code: firstAuthResponse.code
		};

		const schoolAuthResponse = await Networking.doNetworkRequest<SchoolAuthorization.Response>(
			"POST",
			LOGIN_URL + "token",
			schoolAuthRequest
		);

		// for now, we'll just pick the first school and token.
		const selectedSchool = schoolAuthResponse.schools[0];
		const selectedToken = schoolAuthResponse.tokens[0];
		console.log(`Using school: ${selectedSchool.shortName || selectedSchool.name} (${selectedSchool.domain})`);

		// 3. final login, for access token
		const loginRequest: SchoolLogin.Request = {
			client_id: CLIENT_ID,
			grant_type: "refresh_token",
			refresh_token: selectedToken.refresh_token
		};

		// return await Networking.doNetworkRequest<SchoolLogin.Response>(
		// 	"POST",
		// 	"https://student-api.arbor.sc/oauth/token",
		// 	loginRequest,
		// 	{
		// 		"sis-application-id": selectedSchool.sisApplicationId,
		// 	}
		// );

		const session = await Networking.doNetworkRequest<SchoolLogin.Response>(
			"POST",
			API_BASE_URL + "oauth/token",
			loginRequest,
			{
				"sis-application-id": selectedSchool.sisApplicationId,
			}
		);

		return {
			session,
			school: selectedSchool
		};
	}
}