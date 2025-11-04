import { useState, useCallback } from "react";
import {
  Page,
  Card,
  Tabs,
  BlockStack,
  TextField,
  Button,
  Text,
  InlineStack,
  Banner,
  Modal,
  FormLayout,
} from "@shopify/polaris";

export default function SettingsPage() {
  const [selected, setSelected] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerStatus, setBannerStatus] = useState<"success" | "critical">(
    "success",
  );

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  // Security state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setSelected(selectedTabIndex);
  }, []);

  const handleSaveProfile = useCallback(() => {
    // TODO: API integration when backend is ready
    setBannerMessage("Profile settings saved successfully!");
    setBannerStatus("success");
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  }, []);

  const handleChangePassword = useCallback(() => {
    if (newPassword !== confirmPassword) {
      setBannerMessage("Passwords do not match!");
      setBannerStatus("critical");
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
      return;
    }

    // TODO: API integration when backend is ready
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setBannerMessage("Password changed successfully!");
    setBannerStatus("success");
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  }, [newPassword, confirmPassword]);

  const tabs = [
    {
      id: "profile",
      content: "Profile",
      panelID: "profile-content",
    },
    {
      id: "security",
      content: "Security",
      panelID: "security-content",
    },
  ];

  return (
    <Page
      title="Settings"
      subtitle="Manage your account settings and preferences"
    >
      {showBanner && (
        <div style={{ marginBottom: "16px" }}>
          <Banner
            title={bannerMessage}
            tone={bannerStatus}
            onDismiss={() => setShowBanner(false)}
          />
        </div>
      )}

      <Card>
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          <div style={{ padding: "16px" }}>
            {selected === 0 && (
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Profile Information
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Update your profile information and contact details
                </Text>

                <TextField
                  label="Full Name"
                  value={name}
                  onChange={setName}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />

                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Enter your email"
                  autoComplete="email"
                />

                <TextField
                  label="Company Name"
                  value={company}
                  onChange={setCompany}
                  placeholder="Enter your company name"
                  autoComplete="organization"
                />

                <TextField
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                />

                <InlineStack align="end">
                  <Button variant="primary" onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </InlineStack>
              </BlockStack>
            )}

            {selected === 1 && (
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Security Settings
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Manage your password and security preferences
                </Text>

                <Card>
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingSm">
                      Password
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Update your password to keep your account secure
                    </Text>
                    <InlineStack align="start">
                      <Button onClick={() => setShowPasswordModal(true)}>
                        Change Password
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </Card>
              </BlockStack>
            )}
          </div>
        </Tabs>
      </Card>

      <Modal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        primaryAction={{
          content: "Update Password",
          onAction: handleChangePassword,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowPasswordModal(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
