import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import images from "@/constants/images";

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const posthog = usePostHog();

  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const displayName =
    fullName ||
    user?.fullName ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "N/A";

  const handleLogout = async () => {
    try {
      posthog.capture("user_signed_out");
      posthog.reset();
      await signOut();
      router.replace("/sign-in");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="gap-5">
        {/* Header */}
        <Text className="text-primary text-3xl font-bold">Settings</Text>

        {/* User Card */}
        <View className="bg-card rounded-3xl p-5 flex-row items-center gap-4">
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
            className="w-20 h-20 rounded-full"
          />

          <View className="flex-1">
            <Text
              className="text-primary text-xl font-semibold"
              numberOfLines={1}
            >
              {displayName}
            </Text>

            <Text className="text-gray-400 mt-1" numberOfLines={1}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Account Details */}
        <View className="bg-card rounded-3xl p-5 gap-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-400">Account ID:</Text>

            <Text className="text-primary text-end" numberOfLines={1}>
              {user?.id}
            </Text>
          </View>

          <View className="flex-row justify-between items-center ">
            <Text className="text-gray-400">Joined:</Text>

            <Text className="text-primary text-end">{joinedDate}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          className="bg-red-500 rounded-2xl py-4 items-center mt-2"
        >
          <Text className="text-white text-base font-semibold">Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
