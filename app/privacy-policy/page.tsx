'use client'

import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8 safe-top safe-bottom">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString('en-GB')}
          </p>

          <div className="space-y-8 text-gray-700 text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Who we are</h2>
              <p>
                Baraqah is an online matrimonial platform designed for the Muslim community. This Privacy
                Policy explains how we collect, use and protect your personal data when you use our website
                and services, in particular in accordance with the General Data Protection Regulation
                (GDPR) applicable in Europe.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Data controller & contact</h2>
              <p className="mb-2">
                For the purposes of EU data protection law, the data controller is:
              </p>
              <p className="font-medium">
                Baraqah (operated by UX4U) <br />
                Contact email: <a href="mailto:info@ux4u.online" className="text-primary-600 underline">info@ux4u.online</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. What data we collect</h2>
              <p className="mb-2">We only collect data that is necessary to provide a safe and functional matrimonial service:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><span className="font-medium">Account data</span>: email address, password (hashed), optional phone number.</li>
                <li>
                  <span className="font-medium">Profile data</span>: first and last name, age, gender, city, country, education,
                  profession, religious and marital preferences, questionnaire answers and other information you choose to share for matchmaking.
                </li>
                <li>
                  <span className="font-medium">Photos</span>: profile photos you upload, including which photos are primary and
                  the visibility settings you select (private, public, verified-only).
                </li>
                <li>
                  <span className="font-medium">ID verification data (optional)</span>: copy or photo of your identity document
                  for the sole purpose of manual verification by an admin. This is optional but may be required for the “Verified ID” badge.
                </li>
                <li>
                  <span className="font-medium">Usage data</span>: basic technical logs such as IP address, browser type,
                  device information, and timestamps of logins and actions, used for security and abuse prevention.
                </li>
                <li>
                  <span className="font-medium">Messaging data</span>: messages and connection requests exchanged with other users
                  within the platform, as well as reports and blocks you submit.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Purposes & legal bases (GDPR)</h2>
              <p className="mb-2">We process your personal data for the following purposes and legal bases:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <span className="font-medium">To create and maintain your account and profile</span> – to provide the
                  core matrimonial service and allow you to browse and be browsed by others.  
                  <span className="block text-xs text-gray-500">Legal basis: Art. 6(1)(b) GDPR – performance of a contract.</span>
                </li>
                <li>
                  <span className="font-medium">To match you with potential partners and show your profile</span> to other users,
                  according to your preferences and privacy settings.  
                  <span className="block text-xs text-gray-500">Legal basis: Art. 6(1)(b) GDPR – performance of a contract.</span>
                </li>
                <li>
                  <span className="font-medium">To provide secure messaging and safety features</span> (blocking, reporting,
                  moderation and fraud prevention).  
                  <span className="block text-xs text-gray-500">Legal basis: Art. 6(1)(b) &amp; 6(1)(f) GDPR – performance of a contract and legitimate interest in maintaining a safe platform.</span>
                </li>
                <li>
                  <span className="font-medium">To perform optional ID verification</span> so that your profile can receive a
                  “Verified ID” badge visible to other users.  
                  <span className="block text-xs text-gray-500">Legal basis: Art. 6(1)(a) GDPR – your explicit consent by uploading your document.</span>
                </li>
                <li>
                  <span className="font-medium">To comply with legal obligations</span> such as responding to lawful requests
                  from authorities or retaining certain records.  
                  <span className="block text-xs text-gray-500">Legal basis: Art. 6(1)(c) GDPR – legal obligation.</span>
                </li>
                <li>
                  <span className="font-medium">To improve and protect our service</span>, e.g. analytics, performance monitoring,
                  debugging and preventing misuse.  
                  <span className="block text-xs text-gray-500">Legal basis: Art. 6(1)(f) GDPR – legitimate interest in running and improving our platform.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Where your data is stored</h2>
              <p>
                We use Supabase (PostgreSQL database and storage) and other infrastructure providers to host
                our data. Depending on configuration, your data may be stored inside the European Union or in
                other regions with appropriate safeguards (such as standard contractual clauses) to protect
                your data in accordance with GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. How long we keep your data</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Account and profile data are kept while your account is active.</li>
                <li>
                  If you delete your account, we will remove or irreversibly anonymize your personal data
                  within a reasonable period, subject to any legal retention requirements.
                </li>
                <li>
                  Some technical logs and backup copies may persist for a limited time for security,
                  fraud-prevention and disaster-recovery purposes.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Who we share your data with</h2>
              <p className="mb-2">We do <span className="font-semibold">not</span> sell your personal data.</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  Other users see your profile information and photos according to the visibility settings
                  you choose (for example, public/verified-only/private photos).
                </li>
                <li>
                  Service providers that help us operate the platform (hosting, email/SMS, analytics, etc.)
                  may process data strictly on our instructions as data processors.
                </li>
                <li>
                  Public authorities, courts or law enforcement where we are legally required to disclose
                  information.
                </li>
                <li>
                  Aggregated and anonymized information that cannot reasonably identify you, for analytics
                  and product improvement.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Your rights under GDPR</h2>
              <p className="mb-2">If you are located in the European Economic Area (EEA), you have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Access the personal data we hold about you.</li>
                <li>Rectify inaccurate or incomplete information.</li>
                <li>Request deletion of your data (right to be forgotten).</li>
                <li>Restrict or object to certain types of processing.</li>
                <li>Receive your data in a structured, commonly used format (data portability).</li>
                <li>Withdraw your consent at any time, where processing is based on consent (for example, ID verification).</li>
                <li>Lodge a complaint with your local data protection authority.</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:info@ux4u.online" className="text-primary-600 underline">
                  info@ux4u.online
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children&apos;s data</h2>
              <p>
                Our service is intended only for adults aged 18 and above. We do not knowingly collect or
                process data of children. If you believe a minor is using the platform, please contact us so
                we can take appropriate action.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to this policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes,
                for example via email or an in-app notice. The latest version will always be available on
                this page.
              </p>
            </section>

            <section className="border-t border-gray-100 pt-6 text-xs text-gray-500">
              <p>
                This Privacy Policy is intended to describe how we handle personal data on this platform. It
                does not replace independent legal advice. If you operate Baraqah commercially in Europe, we
                strongly recommend you have this text reviewed by a qualified legal professional.
              </p>
            </section>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}