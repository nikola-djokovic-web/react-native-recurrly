import { useSignIn } from "@clerk/expo";
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

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const posthog = usePostHog();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [code, setCode] = useState("");
  const [generalError, setGeneralError] = useState("");

  const sendEmailCode = async () => {
    const emailCodeFactor = signIn.supportedSecondFactors?.find(
      (factor) => factor.strategy === "email_code",
    );

    if (emailCodeFactor) {
      await signIn.mfa.sendEmailCode();
    }
  };

  const finalizeSignIn = async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          return;
        }

        const userId = session?.user?.id;
        const email = session?.user?.primaryEmailAddress?.emailAddress;
        if (userId) {
          posthog.identify(userId, { $set: { email } });
        }
        posthog.capture("user_signed_in", { email });

        const url = decorateUrl("/");
        router.replace(url as Href);
      },
    });
  };

  const handleSubmit = async () => {
    setGeneralError("");

    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      setGeneralError(
        error.longMessage ?? error.message ?? "Unable to sign in.",
      );
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSignIn();
      return;
    }

    if (signIn.status === "needs_client_trust") {
      await sendEmailCode();
      return;
    }

    if (signIn.status === "needs_second_factor") {
      await sendEmailCode();
      return;
    }

    setGeneralError("We couldn’t sign you in. Please try again.");
  };

  const handleVerify = async () => {
    setGeneralError("");

    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await finalizeSignIn();
      return;
    }

    setGeneralError("The code was not accepted. Please try again.");
  };

  const isConfirmStep =
    signIn.status === "needs_client_trust" ||
    signIn.status === "needs_second_factor";
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
            <Text className="auth-heading">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in quickly and securely to manage your subscriptions.
            </Text>

            {isConfirmStep ? (
              <>
                <Text className="auth-meta">
                  A verification code was sent to the email address you entered.
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
                  <Text className="auth-button-text">Verify and continue</Text>
                </Pressable>
                <Pressable
                  className="auth-secondary-button"
                  onPress={sendEmailCode}
                  disabled={isBusy}
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>
                <Pressable
                  className="auth-secondary-button"
                  onPress={() => {
                    signIn.reset();
                    setCode("");
                    setGeneralError("");
                  }}
                  disabled={isBusy}
                >
                  <Text className="auth-secondary-button-text">Start over</Text>
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
                {errors.fields.identifier && (
                  <Text className="auth-error">
                    {errors.fields.identifier.message}
                  </Text>
                )}

                <Text className="auth-label">Password</Text>
                <View className="auth-password-row">
                  <TextInput
                    className="auth-password-input"
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor="#8a8a8a"
                    secureTextEntry={!passwordVisible}
                    onChangeText={setPassword}
                    textContentType="password"
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
                  <Text className="auth-button-text">Continue</Text>
                </Pressable>
              </>
            )}

            <View className="auth-link-row">
              <Text className="auth-meta">Don’t have an account?</Text>
              <Link href="/sign-up" className="auth-link">
                Create one
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
