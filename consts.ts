// deno-lint-ignore-file no-explicit-any
import {SchoolLogin} from "./models/login.ts";

export const LOGIN_URL = "https://login.arbor.sc/oauth/"

export const API_BASE_URL = "https://student-api.arbor.sc/"
export const API_V1_BASE_URL = API_BASE_URL + "student-app-api/v1/" // sorry, "/student-app-api/"?????
																					// brother we are already on "student-api.arbor.sc"... you can't make this stuff up bro ong

export const CLIENT_ID = "ARBOR_STUDENT_APP" // "github.com/StupidRepo/ArborTimetableToPDF" - lol turns out you *need* to use "ARBOR_STUDENT_APP"
export const USER_AGENT = "ArborTimetableToPDF/1.0.0 (github.com/StupidRepo/ArborTimetableToPDF)"

// deno-lint-ignore no-namespace
export namespace Networking {
	export async function doNetworkRequest<T>(type: string, url: string, body: any, headers?: Record<string, string>): Promise<T> {
		// do a fetch request, don't forget to tstringell the server that we accept json and that we are sending json
		const response = await fetch(url, {
			method: type,
			headers: {
				"User-Agent": USER_AGENT,

				"student-app-version": "999", // it blocks some requests that don't have this. as long as it's a number above >1.5, it seems to work

				"Content-Type": "application/json",
				"Accept": "application/json",
				...headers
			},
			body: JSON.stringify(body)
		});

		// check if the response is ok (yes this is the only error handling we'll do... for now O_o)
		if (!response.ok) {
			let errorResponse;
			try {
				errorResponse = await response.json();
			} catch { /* hi */ }
			throw new Error(errorResponse.error_description || `Network request failed with status ${response.statusText} (${response.status})!`);
		}

		const j = await response.json();
		console.log(j);

		// parse the response as json
		return await j as T;
	}

	export async function doAuthedNetworkRequest<T>(session: SchoolLogin.Response, type: "POST" | "GET", url: string, body: any): Promise<T> {
		return await doNetworkRequest<T>(type, url, body, {
			"Cookie": `mis=${session.session_id}`,
			"sis-application-id": session.sisApplicationId
		});
	}
}