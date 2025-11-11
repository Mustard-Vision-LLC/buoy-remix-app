import { useState, useCallback, useEffect } from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";
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
  Avatar,
} from "@shopify/polaris";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  profile_image: string;
  id: string;
  registered: string;
}

export default function SettingsPage() {
  const { profile } = useLoaderData<{
    shop: string;
    accessToken: string;
    profile: ProfileData;
  }>();

  const profileFetcher = useFetcher();
  const passwordFetcher = useFetcher();

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
  const [profileImage, setProfileImage] = useState<File | null>(null);

  // Security state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setName(`${profile.first_name || ""} ${profile.last_name || ""}`.trim());
      setEmail(profile.email || "");
      setCompany(profile.company_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  // Handle profile fetcher response
  useEffect(() => {
    if (profileFetcher.data) {
      const data = profileFetcher.data as { success: boolean; error?: string };
      if (data.success) {
        setBannerMessage("Profile updated successfully!");
        setBannerStatus("success");
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000);
        setProfileImage(null);
      } else {
        setBannerMessage(data.error || "Failed to update profile");
        setBannerStatus("critical");
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000);
      }
    }
  }, [profileFetcher.data]);

  // Handle password fetcher response
  useEffect(() => {
    if (passwordFetcher.data) {
      const data = passwordFetcher.data as { success: boolean; error?: string };
      if (data.success) {
        setBannerMessage("Password changed successfully!");
        setBannerStatus("success");
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000);
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setBannerMessage(data.error || "Failed to change password");
        setBannerStatus("critical");
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000);
      }
    }
  }, [passwordFetcher.data]);

  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setSelected(selectedTabIndex);
  }, []);

  const handleSaveProfile = useCallback(() => {
    const formData = new FormData();
    formData.append("intent", "updateProfile");
    formData.append("fullname", name);
    formData.append("company_name", company);
    formData.append("phone", phone);

    if (profileImage) {
      formData.append("profile_picture", profileImage);
    }

    profileFetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });
  }, [name, company, phone, profileImage, profileFetcher]);

  const handleChangePassword = useCallback(() => {
    if (newPassword !== confirmPassword) {
      setBannerMessage("Passwords do not match!");
      setBannerStatus("critical");
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("intent", "changePassword");
    formData.append("old_password", currentPassword);
    formData.append("new_password", newPassword);

    passwordFetcher.submit(formData, { method: "post" });
  }, [currentPassword, newPassword, confirmPassword, passwordFetcher]);

  const hasUnsavedChanges =
    name !== `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
    company !== (profile.company_name || "") ||
    phone !== (profile.phone || "") ||
    profileImage !== null;

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

                {profile.profile_image && (
                  <InlineStack gap="300" align="start">
                    <Avatar
                      customer
                      name={name}
                      size="xl"
                      source={profile.profile_image}
                    />
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {name || "User"}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Joined{" "}
                        {new Date(profile.registered).toLocaleDateString(
                          "en-US",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                )}

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
                  disabled
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
                  <Button
                    variant="primary"
                    onClick={handleSaveProfile}
                    disabled={
                      !hasUnsavedChanges ||
                      profileFetcher.state === "submitting"
                    }
                    loading={profileFetcher.state === "submitting"}
                  >
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
          content:
            passwordFetcher.state === "submitting"
              ? "Updating..."
              : "Update Password",
          onAction: handleChangePassword,
          loading: passwordFetcher.state === "submitting",
          disabled: !currentPassword || !newPassword || !confirmPassword,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowPasswordModal(false),
            disabled: passwordFetcher.state === "submitting",
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
