export default function DeleteAccountPage() {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-6 space-y-8 text-sm leading-relaxed">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold">Delete Your Account</h1>
        <p className="text-muted-foreground">Guru 2 u</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How to request deletion</h2>
        <p>
          To delete your Guru 2 u account and associated data, send an email to{' '}
          <a href="mailto:support@thechiguru.com?subject=Account%20deletion%20request" className="text-primary underline">
            support@thechiguru.com
          </a>{' '}
          from the email address or with the phone number associated with your account, with the
          subject line "Account deletion request".
        </p>
        <p>We'll confirm your identity and process the request within 30 days.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What gets deleted</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your account (email, phone number, and sign-in credentials)</li>
          <li>Your reading history (all saved face, palm, voice, and astrology readings)</li>
          <li>Any photos or audio recordings associated with your readings</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What we retain</h2>
        <p>
          Records of completed purchases are retained as required for accounting, tax, and legal
          compliance, even after account deletion. This data is not linked to your deleted account
          for any other purpose.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Questions</h2>
        <p>
          For any questions about this process, contact{' '}
          <a href="mailto:support@thechiguru.com" className="text-primary underline">
            support@thechiguru.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
