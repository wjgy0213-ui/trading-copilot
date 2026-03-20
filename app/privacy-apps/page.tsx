export const metadata = {
  title: "Privacy Policy - SlowMan Studios Apps",
  description: "Privacy policy for Piano Hero, KindWords, SubTracker and other SlowMan Studios applications.",
};

export default function PrivacyAppsPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif", color: "#e5e7eb", backgroundColor: "#0f172a", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: "#94a3b8", marginBottom: 32 }}>SlowMan Studios — Piano Hero, KindWords, SubTracker</p>
      <p style={{ color: "#94a3b8", marginBottom: 24 }}>Last updated: March 19, 2026</p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 12 }}>Overview</h2>
      <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
        SlowMan Studios (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) builds browser extensions and web applications including Piano Hero, KindWords, and SubTracker. We are committed to protecting your privacy.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 12 }}>Data Collection</h2>
      <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
        <strong>We do not collect, store, or transmit any personal data.</strong> Our applications run entirely in your browser. No data is sent to any external server.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 12 }}>Local Storage</h2>
      <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
        Some of our apps use your browser&apos;s localStorage to save preferences and progress (e.g., high scores in Piano Hero, subscriptions in SubTracker). This data never leaves your device and is not accessible to us or any third party.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 12 }}>Third-Party Services</h2>
      <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
        Our applications do not integrate with any third-party analytics, advertising, or tracking services. KindWords offers an optional OpenAI integration that requires users to provide their own API key — we never see or store these keys.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 12 }}>Permissions</h2>
      <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
        Our Chrome extensions request only the minimum permissions needed to function (e.g., new tab page override). We do not request access to your browsing history, bookmarks, or any other personal data.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 12 }}>Children&apos;s Privacy</h2>
      <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
        Our applications are suitable for all ages. We do not knowingly collect any information from children or any other users.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 12 }}>Changes</h2>
      <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
        We may update this privacy policy from time to time. Any changes will be posted on this page.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 12 }}>Contact</h2>
      <p style={{ lineHeight: 1.7, marginBottom: 16 }}>
        If you have questions about this privacy policy, please contact us at wjgy0213@gmail.com.
      </p>
    </div>
  );
}
