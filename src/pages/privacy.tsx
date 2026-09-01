export default function PrivacyPage() {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto p-6 space-y-8 text-sm leading-relaxed">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: September 1, 2026</p>
      </div>

      <p>
        Guru 2 u ("we", "us", "the app") provides AI-generated personality readings based on
        photos, voice recordings, and birth details you choose to submit. This policy explains
        what information we collect, how it's used, and the choices you have.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Information we collect</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Account information:</strong> your email address or phone number, used to
            sign you in via Firebase Authentication (email/password, phone verification, or
            Google Sign-In).
          </li>
          <li>
            <strong>Photos:</strong> face or palm photos you take or upload for a reading. These
            are sent to our AI provider for analysis and are not used for facial recognition or
            identity verification.
          </li>
          <li>
            <strong>Audio recordings:</strong> voice recordings you submit for voice-based
            readings, sent to our AI provider for transcription and analysis.
          </li>
          <li>
            <strong>Birth details:</strong> birth date, time, and place you enter for astrology
            readings.
          </li>
          <li>
            <strong>Reading results:</strong> the generated reading (summary, traits, guidance,
            and similar content) is stored in your account so you can view your reading history.
          </li>
          <li>
            <strong>Purchase information:</strong> if you buy reading credits, Google Play
            processes the payment directly. We receive a purchase token to verify and grant your
            credits — we never see or store your payment card details.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How we use your information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To generate the reading you requested (face, palm, voice, or astrology).</li>
          <li>To maintain your account and reading history across sessions and devices.</li>
          <li>To verify purchases and grant reading credits.</li>
          <li>To operate, secure, and improve the app.</li>
        </ul>
        <p>We do not sell your personal information, and we do not use your photos or voice recordings for advertising.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Third-party services</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Google Firebase</strong> — authentication and account management.
          </li>
          <li>
            <strong>Google Gemini</strong> — AI analysis of photos, audio, and birth details to
            generate your reading.
          </li>
          <li>
            <strong>Google Play Billing</strong> — payment processing for reading-credit
            purchases.
          </li>
        </ul>
        <p>Each of these providers processes data under their own privacy policies.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Data retention and deletion</h2>
        <p>
          Your reading history is kept until you delete individual readings or request account
          deletion. To request deletion of your account and associated data, contact us using the
          details below.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Camera and microphone permissions</h2>
        <p>
          The app requests camera access to take photos for face and palm readings, and
          microphone access to record voice for voice readings. These permissions are used only
          when you actively start a reading — the app does not access the camera or microphone in
          the background.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Your choices</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>You can delete individual readings from your history at any time.</li>
          <li>You can sign out of your account at any time.</li>
          <li>You can decline camera/microphone permissions, though this limits which reading types you can use.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Changes to this policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be reflected by
          updating the "Last updated" date above.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Contact us</h2>
        <p>
          If you have questions about this policy or wish to request deletion of your data,
          contact us at{' '}
          <a href="mailto:support@thechiguru.com" className="text-primary underline">
            support@thechiguru.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
