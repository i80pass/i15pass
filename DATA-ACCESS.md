# i15pass: NDOT (Nevada 511) Data Access Notes

Date: November 4, 2026
Status: Terms researched on the public record. Account and key NOT yet obtained. Signup is a live browser step and is handed back to the parent agent (details at the bottom).

## What the public NDOT developer documentation says

Source: https://www.nvroads.com/developers/doc (Nevada API Documentation, Nevada 511)

Quoted exactly:

- "The REST API provides simple interfaces to most of the data available on the Nevada 511 website. The REST API enables developers to access essential data on the Nevada 511 website including Road Conditions, Cameras, Weather Stations, Message Signs, Rest Areas, Welcome Centers, Truck Parking, Events, Advisories. This API enables developers to create mobile traffic apps for Nevada."
- "Requires a developer key. For most calls, query string 'key' parameter is required."
- "Throttling is enabled. Ten calls every 60 seconds."
- "A registered account is needed before you can sign up for a Developer API key. For new users, sign up for an account; otherwise log in and then you can request for an API key here. The Developer API key info will display here as well."

What the public documentation does NOT contain, after a full read of the developer page, every endpoint page sampled (Cameras, Road Conditions), and the site privacy page:

- No statement about commercial use, for or against.
- No statement about redistribution of camera images or conditions data, for or against.
- No attribution requirement of any kind.
- No fee, no license grant, no license restriction, no terms of service or API agreement text anywhere on the public pages.

The only other official text on the site is the privacy policy (https://www.nvroads.com/about/privacy), which covers personal information in the My511 account system only. Relevant quotes:

- "There is no charge for you to register or to use the service."
- "If you choose to register for My511 Services, we will keep track only of the information and preferences that you choose to provide to us."

A third party security review also noted the gap, in its words: "No visible terms of service or security policy pages" on nvroads.com (guard.report). That is a third party observation, not an NDOT statement.

## Platform context (verified from official docs and third party audits)

- Nevada 511 runs on the same Travel-IQ platform family as Idaho 511 and UDOT Traffic (same /api/v2/get/ shape, same key as a query string, same 10 calls per 60 seconds throttle). The network already holds an Idaho 511 key on this exact pattern (approved November 4, 2026) and displays Idaho cameras and conditions with source attribution as its house standard.
- One version wrinkle to check at build: the Cameras endpoint doc lists https://www.nvroads.com/api/v2/get/cameras while the Road Conditions endpoint doc lists https://www.nvroads.com/api/v3/get/roadconditions . Confirm the live version per resource when the key is tested.
- Camera records carry a Source field and Views with Url (https://www.nvroads.com/map/Cctv/<id>) and VideoUrl fields.
- Independent audits (CommuteScout state expansion audit, July 2026) class Nevada as Tier A: "one free API key (or no key) and go", and note the states that DO prohibit reuse by name (for example Texas and Arkansas). Nevada is not listed among the prohibiting states. Third party material, useful context, not a legal source.

## Signup flow, as documented publicly

Source: https://www.nvroads.com/my511/register (sign up guide)

- "You can now sign up with either your email or phone number."
- "Enter your name, email, and create a password. Click 'Sign Up' when done."
- "You will get an email to verify your account, click the link that was sent to your email."
- Phone is optional: "Including a phone number will allow you to receive text notifications, you will receive an SMS (text) with your confirmation code. Note this is in addition to the email verification."
- After the account exists and is verified, the developer key is requested from https://www.nvroads.com/developers/doc while logged in, and the key displays on that page. No manual approval step is described for Nevada (Idaho, on the same platform, did have an approval wait and an approval email, so a wait is possible in practice).

## Blockers for this agent, stated plainly

1. This agent cannot operate a live browser. Registration is a form fill, an email verification link click, a login, and a key request click, all in the signed in browser session. That portion must be run by the parent agent through a browser task.
2. The signup requires creating a NEW account password for contact@brightreddesign.com on nvroads.com. A new account password must be set by Tracy through the Secure Vault capture page. It must not be invented by an agent, typed in chat, or stored anywhere else. If a Nevada 511 login already exists in the Secure Vault, the browser task should use it instead and skip this blocker.
3. Any terms, API agreement, or checkbox presented inside the signup or key request flow is not visible on the public pages and can only be read during the live flow. If the flow presents terms that prohibit commercial use or redistribution, the browser task must STOP before agreeing and report the exact text.

## Exact browser task to run next

1. Open https://www.nvroads.com/developers/doc and follow the sign up link.
2. Register under contact@brightreddesign.com, name Tracy Vickrey, email route only (no phone number, so no SMS code is needed).
3. Password: use the Secure Vault. If no Nevada 511 login exists there, stop and have Tracy set one on the capture page.
4. Verify the account from the confirmation email in the Zoho studio mailbox (contact@brightreddesign.com) in the same browser session.
5. Log in, return to https://www.nvroads.com/developers/doc, request the developer key. Read and report any terms shown before accepting them. If terms prohibit commercial use or redistribution of cameras or data, stop and report the text instead of accepting.
6. On success, the key goes only into the NDOT_API_KEY value in ~/workspace/i15pass/.env.local and later into the hosting environment variable. Never into chat, a doc, or a build log.
7. Test once, read only: GET https://www.nvroads.com/api/v2/get/cameras?key=<key> and confirm real camera records return, and note any I-15 records in the Las Vegas to state line stretch (roadway names containing I-15, locations such as Jean, Primm, Sloan). Respect the 10 calls per 60 seconds throttle; one or two test calls only.

## Verdict on terms

On the public record, nothing prohibits our use. NDOT publishes this API expressly so developers can build traveler information products ("This API enables developers to create mobile traffic apps for Nevada"), charges nothing, and states no commercial ban, no redistribution ban, and no attribution requirement. The honest limit: silence is not the same as an express license. The definitive terms, if any exist, live inside the signup flow and must be read there before the key is accepted. Provided the in-flow terms do not add a prohibition, the use is allowed on the same footing as the Idaho 511 key the network already operates: display NDOT conditions and cameras on i15pass.com with a visible "Source: Nevada 511 / NDOT" credit (our house standard even where not required), cached calls inside the stated throttle, and Google ads added later under Tracy's standing monetization rule.
