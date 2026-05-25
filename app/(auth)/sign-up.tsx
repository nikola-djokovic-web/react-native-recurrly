import { useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { usePostHog } from "posthog-react-native";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const posthog = usePostHog();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [code, setCode] = useState("");
  const [generalError, setGeneralError] = useState("");

  const finalizeSignUp = async () => {
    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          return;
        }

        const userId = session?.user?.id;
        const email = session?.user?.primaryEmailAddress?.emailAddress;
        if (userId) {
          posthog.identify(userId, {
            $set: { email },
            $set_once: { first_signup_date: new Date().toISOString() },
          });
        }
        posthog.capture("user_signed_up", { email });

        const url = decorateUrl("/");
        router.replace(url as Href);
      },
    });
  };

  const handleSubmit = async () => {
    setGeneralError("");

    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      setGeneralError(
        error.longMessage ?? error.message ?? "Unable to create your account.",
      );
      return;
    }

    if (signUp.status === "complete") {
      await finalizeSignUp();
      return;
    }

    if (
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address")
    ) {
      await signUp.verifications.sendEmailCode();
      return;
    }

    setGeneralError(
      "We couldn’t create your account. Please check your details and try again.",
    );
  };

  const handleVerify = async () => {
    setGeneralError("");

    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await finalizeSignUp();
      return;
    }

    setGeneralError("That code did not verify. Please try again.");
  };

  const showVerificationStep =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;
  const isBusy = fetchStatus === "fetching";

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-card">
            <Text className="auth-heading">Create your account</Text>
            <Text className="auth-subtitle">
              Secure access to your subscriptions with email and password.
            </Text>

            {showVerificationStep ? (
              <>
                <Text className="auth-meta">
                  Enter the verification code sent to your email.
                </Text>
                <TextInput
                  className="auth-input"
                  value={code}
                  placeholder="Enter verification code"
                  placeholderTextColor="#8a8a8a"
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />
                {(errors.fields.code || generalError) && (
                  <Text className="auth-error">
                    {errors.fields.code?.message ?? generalError}
                  </Text>
                )}
                <Pressable
                  className="auth-button"
                  onPress={handleVerify}
                  disabled={isBusy}
                >
                  <Text className="auth-button-text">Verify email</Text>
                </Pressable>
                <Pressable
                  className="auth-secondary-button"
                  onPress={() => signUp.verifications.sendEmailCode()}
                  disabled={isBusy}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text className="auth-label">Email address</Text>
                <TextInput
                  className="auth-input"
                  value={emailAddress}
                  placeholder="you@company.com"
                  placeholderTextColor="#8a8a8a"
                  onChangeText={setEmailAddress}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
                {errors.fields.emailAddress && (
                  <Text className="auth-error">
                    {errors.fields.emailAddress.message}
                  </Text>
                )}

                <Text className="auth-label">Password</Text>
                <View className="auth-password-row">
                  <TextInput
                    className="auth-password-input"
                    value={password}
                    placeholder="Create a strong password"
                    placeholderTextColor="#8a8a8a"
                    secureTextEntry={!passwordVisible}
                    onChangeText={setPassword}
                    textContentType="newPassword"
                  />
                  <Pressable
                    className="auth-password-toggle"
                    onPress={() => setPasswordVisible((visible) => !visible)}
                  >
                    <Text className="auth-password-toggle-text">
                      {passwordVisible ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
                {errors.fields.password && (
                  <Text className="auth-error">
                    {errors.fields.password.message}
                  </Text>
                )}
                {generalError ? (
                  <Text className="auth-error">{generalError}</Text>
                ) : null}

                <Pressable
                  className="auth-button"
                  onPress={handleSubmit}
                  disabled={isBusy || !emailAddress || !password}
                >
                  <Text className="auth-button-text">Create account</Text>
                </Pressable>
              </>
            )}

            <View className="auth-link-row">
              <Text className="auth-meta">Already have an account?</Text>
              <Link href="/sign-in" className="auth-link">
                Sign in
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
