# ArborTimetableToPDF
Quite a self-explantory title. This is a simple script that takes your Arbor timetable and converts it to a PDF.

## Requirements
- Deno (https://deno.land/)
- A valid Arbor **student** account with access to your timetable.
- A hard drive
- An internet connection
- Some way to open a PDF file lol

## Usage
1. Clone the repository
2. Run `deno run --allow-net --allow-write --allow-read main.ts`
   - Alternatively, you can run `deno run dev`.
3. Enter your Arbor Student email and password when prompted.
   - You can also create a .env file with the following contents:
	```
    EMAIL="a.student@some.school"
    PASS="yourpassword"
    ```
4. Be patient...
   - The script will log in to your Arbor account, fetch your timetable, and generate a PDF file named `timetable.pdf` in the current directory.
5. Enjoy!

## Disclaimer
Not affiliated with Arbor in any way. Use at your own risk. I am not responsible for any possible damage caused by this script.

Also, before using this script, make sure it's all good to even run this script (your school might have some stupid policies).
