import LegalLayout from "@/components/legal/LegalLayout";
import LegalHeader from "@/components/legal/LegalHeader";
import LegalSection from "@/components/legal/LegalSection";

export const metadata = {
    title: 'Cookie Policy | Hamsa Institute',
    description: 'Cookie Policy for Hamsa Institute of Occoured Science',
}

export default function CookiePolicy() {
    const lastUpdated = "June 15, 2026";

    return (
        <LegalLayout>
            <LegalHeader title="Cookie Policy" lastUpdated={lastUpdated} />

            <LegalSection>
                <p>
                    This Cookie Policy explains what cookies are and how Hamsa Institute of Occoured Science ("we," "us," or "our") uses them on our website. You should read this policy so you can understand what type of cookies we use, the information we collect using cookies, and how that information is used.
                </p>
            </LegalSection>

            <LegalSection title="1. What Are Cookies?">
                <p>Cookies are small text files that are sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.</p>
                <p>Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your personal computer or mobile device when you go offline, while session cookies are deleted as soon as you close your web browser.</p>
            </LegalSection>

            <LegalSection title="2. How We Use Cookies">
                <p>When you use and access the Service, we may place a number of cookies files in your web browser. We use cookies for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li><strong>Essential Cookies:</strong> We use essential cookies to authenticate users and prevent fraudulent use of user accounts.</li>
                    <li><strong>Preferences Cookies:</strong> We use preferences cookies to remember information that changes the way the Service behaves or looks, such as the "remember me" functionality of a registered user or the user's language preference.</li>
                    <li><strong>Analytics Cookies:</strong> We use analytics cookies to track information how the Service is used so that we can make improvements. We may also use analytics cookies to test new advertisements, pages, features or new functionality of the Service to see how our users react to them.</li>
                </ul>
            </LegalSection>

            <LegalSection title="3. Third-Party Cookies">
                <p>In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.</p>
                <p>For example, we use Google Analytics to help us understand how our customers use the Site.</p>
            </LegalSection>

            <LegalSection title="4. What Are Your Choices Regarding Cookies">
                <p>If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser.</p>
                <p>Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>For the Chrome web browser, please visit this page from Google: <a href="https://support.google.com/accounts/answer/32050" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://support.google.com/accounts/answer/32050</a></li>
                    <li>For the Internet Explorer web browser, please visit this page from Microsoft: <a href="http://support.microsoft.com/kb/278835" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">http://support.microsoft.com/kb/278835</a></li>
                    <li>For the Firefox web browser, please visit this page from Mozilla: <a href="https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://support.mozilla.org/en-US/kb/delete-cookies-remove-info-websites-stored</a></li>
                    <li>For the Safari web browser, please visit this page from Apple: <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac</a></li>
                </ul>
            </LegalSection>

            <LegalSection title="5. Contact Us">
                <p>If you have any questions about our use of cookies, please contact us at:</p>
                <p className="mt-2 text-blue-400">info@hamsainstitute.com</p>
            </LegalSection>
        </LegalLayout>
    );
}
