# Phone + password authentication

OldiSotdi now uses this phone authentication flow:

- Registration: +998 phone number + password + repeated password -> one SMS verification -> Firebase phone identity is linked to the password provider.
- Login: phone number + password, without SMS.
- Password recovery: phone number + new password + repeated password -> SMS verification -> password is updated.
- Existing legacy phone-only accounts can set a password after successfully verifying the same phone number by SMS.
- Firebase durable local persistence remains enabled so sessions survive normal browser restarts.

Implementation detail: Firebase does not expose a native phone+password provider. The verified phone identity is linked to Firebase's password provider through a deterministic internal email alias derived from the canonical +998 number. The alias is an implementation detail and is not shown in the UI.
