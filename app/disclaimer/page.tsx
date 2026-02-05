'use client'

import Link from 'next/link'

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Important Disclaimer</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Platform Purpose</h2>
              <p>
                Baraqah is a matrimony platform designed to facilitate respectful, 
                family-oriented matchmaking within the Muslim community. This platform is 
                <strong> NOT a dating or hookup site</strong>. We emphasize traditional values, 
                privacy, and authentic relationships leading to marriage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">User Responsibility</h2>
              <p>
                Users are solely responsible for their interactions and communications on this platform. 
                We strongly advise:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Verify the identity and intentions of other users before sharing personal information</li>
                <li>Meet in public places with family members present when meeting offline</li>
                <li>Report any suspicious or inappropriate behavior immediately</li>
                <li>Do not share personal contact information (phone numbers, emails, social media) through the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Platform Limitation of Liability</h2>
              <p>
                <strong>Baraqah and its operators are NOT responsible for:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Any offline meetings, interactions, or relationships that occur outside the platform</li>
                <li>The accuracy of information provided by users</li>
                <li>Any harm, loss, or damages resulting from user interactions</li>
                <li>The sharing of personal contact information by users (despite our filtering efforts)</li>
                <li>Any fraudulent or deceptive behavior by users</li>
                <li>Decisions made by users regarding marriage or relationships</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Privacy and Security</h2>
              <p>
                While we implement strong privacy controls and content filtering, users should understand that:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>No online platform can guarantee 100% security or privacy</li>
                <li>Users should exercise caution when sharing any personal information</li>
                <li>Our content filtering attempts to block personal contact information, but may not catch all variations</li>
                <li>Users are responsible for protecting their own personal information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Prohibited Content</h2>
              <p>
                The following content is strictly prohibited and will result in account suspension:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Sharing phone numbers, email addresses, or social media handles</li>
                <li>Dating or hookup-related language or requests</li>
                <li>Inappropriate, offensive, or disrespectful content</li>
                <li>False or misleading information</li>
                <li>Harassment or unsolicited advances</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Acknowledgment</h2>
              <p>
                By using this platform, you acknowledge that you have read, understood, and agree to this disclaimer. 
                You understand that Baraqah is a tool to facilitate connections, but the responsibility 
                for your safety and decisions rests entirely with you.
              </p>
            </section>

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-semibold">
                ⚠️ Warning: Never share personal contact information through this platform. 
                Always verify identities and involve family members in the matchmaking process.
              </p>
            </div>

            <div className="mt-8 flex space-x-4">
              <Link
                href="/"
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                I Understand - Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}