import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const onboarding = () => {
  return (
    <View>
      <Text>onboarding</Text>
      <Link
        href="/"
        className="mt-4 text-lg bg-primary text-white px-4 py-2 rounded"
      >
        Go Back
      </Link>
    </View>
  );
};

export default onboarding;
