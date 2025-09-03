// deno-lint-ignore-file no-namespace
import {API_BASE_URL, Networking} from "../consts.ts";
import {SchoolLogin} from "./login.ts";

export namespace User {
	export interface Response {
		items: {
			display_name: string;
		}[];
	}

	export async function getUserDetails(session: SchoolLogin.Response): Promise<User.Response> {
		return await Networking.doAuthedNetworkRequest<User.Response>(session, "GET", API_BASE_URL + "auth/current-user-settings", undefined);
	}
}