'use client'

import Link from 'next/link'

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8 safe-top safe-bottom">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString('en-GB')}
          </p>

          <div className="space-y-8 text-gray-700 text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Purpose of the service</h2>
              <p>
                Baraqah is a respectful matrimonial platform for Muslims. The service is intended solely to
                help adult users explore potential marriage matches. It is not a dating or entertainment app.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Eligibility</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>You must be at least 18 years old to create an account and use Baraqah.</li>
                <li>You confirm that you are legally able to marry under the laws that apply to you.</li>
                <li>You must provide accurate information and create only one personal account.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Your responsibilities</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>You are responsible for all activity on your account and for keeping your password safe.</li>
                <li>
                  You agree to use the platform with respect, modesty and in line with Islamic and local laws.
                </li>
                <li>
                  You must not share false, misleading or offensive information in your profile or messages.
                </li>
                <li>
                  You must not share direct contact details (phone, email, social media) in public profile fields
                  where this is restricted by the app.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Prohibited behaviour</h2>
              <p className="mb-2">You agree that you will not:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Harass, abuse, insult, threaten or exploit any other user.</li>
                <li>Request or send explicit, inappropriate or unlawful content.</li>
                <li>Use the platform for commercial advertising, scams or any non-matrimonial purpose.</li>
                <li>Impersonate another person or misrepresent your identity or intentions.</li>
                <li>Attempt to hack, scrape or reverse engineer the platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Profile & verification</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  You may optionally upload an identity document for manual review by an admin to receive the
                  “Verified ID” badge.
                </li>
                <li>
                  Verification is not a guarantee or legal certification; it only confirms that we have seen
                  a matching document.
                </li>
                <li>
                  We reserve the right to remove or hide any profile or content that we consider inappropriate,
                  misleading or unsafe, with or without prior notice.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Messaging & safety</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  Messaging is only available after a connection request has been approved, to reduce spam
                  and abuse.
                </li>
                <li>
                  Personal contact information may be automatically filtered from messages to protect users.
                </li>
                <li>
                  You should always exercise caution and involve trusted family/guardians in your decisions.
                  We cannot guarantee the intentions or background of any user.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data protection</h2>
              <p>
                Our processing of your personal data is described in detail in our{' '}
                <Link href="/privacy-policy" className="text-primary-600 underline">
                  Privacy Policy
                </Link>
                , which forms part of these Terms. By using Baraqah you confirm that you have read and
                understood the Privacy Policy, especially in relation to data collected and stored in Europe.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Account suspension & termination</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  You may delete your account at any time using the in-app settings, which will deactivate
                  your profile and start deletion of your personal data as described in the Privacy Policy.
                </li>
                <li>
                  We may suspend or terminate your account, limit features or remove content if we believe you
                  have violated these Terms, endangered other users, or misused the platform.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. No guarantee or liability</h2>
              <p>
                We provide Baraqah on an “as is” and “as available” basis. While we make reasonable efforts to
                maintain a safe and reliable service, we do not guarantee that you will find a suitable match
                or that all information provided by users is accurate. To the maximum extent permitted by law,
                we are not liable for any loss or damage arising from use of the platform, except where caused
                by our intentional misconduct or gross negligence.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Applicable law</h2>
              <p>
                These Terms are intended to comply with applicable European consumer and data-protection laws.
                The specific governing law and jurisdiction may depend on your country of residence and the
                operator&apos;s place of establishment. If any part of these Terms is found invalid, the
                remainder shall continue in full force.
              </p>
            </section>

            <section className="border-t border-gray-100 pt-6 text-xs text-gray-500">
              <p>
                These Terms of Use are a general framework for using this matrimonial platform and are not a
                substitute for independent legal advice. If you operate Baraqah commercially in Europe, please
                have these Terms reviewed by a qualified lawyer to adapt them to your exact situation.
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

