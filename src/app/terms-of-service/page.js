import LegalLayout from "@/components/legal/LegalLayout";
import LegalHeader from "@/components/legal/LegalHeader";
import LegalSection from "@/components/legal/LegalSection";

export const metadata = {
    title: 'Terms of Service | Hamsa Institute',
    description: 'Terms of Service for Hamsa Institute of Occoured Science',
}

export default function TermsOfService() {
    const lastUpdated = "June 15, 2026";

    return (
        <LegalLayout>
            <LegalHeader title="Terms of Service" lastUpdated={lastUpdated} />

            <LegalSection>
                <p>
                    These Terms of Service ("Terms") govern your access to and use of the Hamsa Institute of Occoured Science website and services. By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                </p>
            </LegalSection>

            <LegalSection title="1. Educational Services">
                <p>Hamsa Institute provides online and offline educational courses in Occoured Science. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without notice.</p>
                <p>Course content, including videos, documents, and quizzes, is for personal educational use only. Unauthorized distribution or commercial use of our materials is strictly prohibited.</p>
            </LegalSection>

            <LegalSection title="2. Accounts">
                <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>
            </LegalSection>

            <LegalSection title="3. Payments and Refunds">
                <p><strong>Fees:</strong> You agree to pay all fees associated with the courses you purchase. Fees are non-transferable.</p>
                <p><strong>Refunds:</strong> We offer a 7-day refund policy for selected courses if you are unsatisfied with the content. Refund requests must be made in writing within 7 days of purchase. Only courses with less than 20% consumption are eligible for refunds.</p>
                <p><strong>Payment Processing:</strong> Payments are processed securely via Razorpay. We do not store your complete payment information.</p>
            </LegalSection>

            <LegalSection title="4. Intellectual Property">
                <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Hamsa Institute of Occoured Science and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries.</p>
            </LegalSection>

            <LegalSection title="5. User Conduct">
                <p>You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. Prohibited activities include:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>Harassing or threatening other students or instructors.</li>
                    <li>Sharing your account credentials with others.</li>
                    <li>Attempting to bypass security measures.</li>
                    <li>Posting inappropriate or offensive content in discussion forums.</li>
                </ul>
            </LegalSection>

            <LegalSection title="6. Termination">
                <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                <p>All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
            </LegalSection>

            <LegalSection title="7. Changes">
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            </LegalSection>

            <LegalSection title="8. Contact Us">
                <p>If you have any questions about these Terms, please contact us at:</p>
                <p className="mt-2 text-blue-400">info@hamsainstitute.com</p>
            </LegalSection>
        </LegalLayout>
    );
}
