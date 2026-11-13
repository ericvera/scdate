Work on the following task. You are the one responsible for the task so consider any suggestions about the problem or implementation as guidance and make your own informed suggestions and recommendation.

[bug] accept zone aliases and UTC in scdate isValidTimeZone

isValidTimeZone in scdate 9.0.0 (dist/isValidTimeZone.js) returns Intl.supportedValuesOf('timeZone').includes(timeZone). That list holds only canonical IANA names, so the function rejects zones the rest of the JavaScript runtime accepts and that scdate's own functions use without complaint.

On Node 24.18:

Zone	new Intl.DateTimeFormat(…, { timeZone })	isValidTimeZone
UTC	accepted	false
Etc/UTC	accepted	false
GMT	accepted	false
US/Eastern	accepted	false
Asia/Kolkata	accepted	false
america/puerto_rico	accepted	false
America/Puerto_Rico	accepted	true
scdate disagrees with itself: getUTCMillisecondsFromDate('2025-03-09', 'UTC') works and returns Date.UTC(2025, 2, 9), while isValidTimeZone('UTC') says the zone is invalid.
Asia/Kolkata is the current name for India's zone, but some runtimes list it under the older Asia/Calcutta. The answer then depends on which ICU version the runtime ships.
Effect on Okven: validateAttributionConfig in @okv/attribution keeps its own Intl.DateTimeFormat try/catch instead of calling isValidTimeZone. Switching would reject UTC and other zones that are accepted today. Production only uses America/Puerto_Rico, so nothing is broken now.

Fix: have isValidTimeZone construct Intl.DateTimeFormat with the zone inside a try/catch and return false only when it throws. Release that in an scdate patch.

Done when:

isValidTimeZone returns true for every zone in the table above, and false for Invalid/Zone and +05:00.
scdate tests cover UTC, an old alias, and a lowercase name.
validateAttributionConfig uses isValidTimeZone, and its tests still pass.
