import LegalLayout from "@/components/legal/LegalLayout";
import LegalHeader from "@/components/legal/LegalHeader";
import LegalSection from "@/components/legal/LegalSection";

export const metadata = {
    title: 'Privacy Policy | Hamsa Institute',
    description: 'Privacy Policy for Hamsa Institute of Occoured Science',
}

export default function PrivacyPolicy() {
    const lastUpdated = "June 15, 2026";

    return (
        <LegalLayout>
            <LegalHeader title="Privacy Policy" lastUpdated={lastUpdated} />

            <LegalSection>
                <p>
                    At Hamsa Institute of Occoured Science ("we," "our," or "us"), we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our educational platform.
                </p>
                <p>
                    Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
            </LegalSection>

            <LegalSection title="1. Information We Collect">
                <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the website or when you choose to participate in various activities related to the website.</li>
                    <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the website, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the website.</li>
                </ul>
            </LegalSection>

            <LegalSection title="2. Payment Processing">
                <p>We use Razorpay for processing payments. We/Razopay do not store your card data on their servers. The data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) when processing payment. Your purchase transaction data is only used as long as is necessary to complete your purchase transaction. After that is complete, your purchase transaction information is not saved.</p>
                <p>Our payment gateway adheres to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, MasterCard, American Express and Discover.</p>
                <p>PCI-DSS requirements help ensure the secure handling of credit card information by our store and its service providers.</p>
                <p>For more insight, you may also want to read Razorpay’s Terms and Conditions.</p>
            </LegalSection>

            <LegalSection title="3. How We Use Your Information">
                <p>We use the information we collect or receive:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>To facilitate account creation and logon process.</li>
                    <li>To send you administrative information.</li>
                    <li>To fulfill and manage your orders.</li>
                    <li>To post testimonials.</li>
                    <li>To deliver targeted advertising to you.</li>
                    <li>To administer prize draws and competitions.</li>
                    <li>To request feedback.</li>
                    <li>To protect our Services.</li>
                </ul>
            </LegalSection>

            <LegalSection title="4. Disclosure of Your Information">
                <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                    <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
                </ul>
            </LegalSection>

            <LegalSection title="5. Security of Your Information">
                <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
            </LegalSection>

            <LegalSection title="6. Contact Us">
                <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="font-semibold text-white">Hamsa Institute of Occoured Science</p>
                    <p>123 Education Lane, Knowledge City</p>
                    <p>Bangalore - 560001</p>
                    <p>Email: <a href="mailto:privacy@hamsainstitute.com" className="text-blue-400 hover:underline">privacy@hamsainstitute.com</a></p>
                    <p>Phone: +91 98765 43210</p>
                </div>
            </LegalSection>
        </LegalLayout>
    );
}
