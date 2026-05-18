import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SignIn = () => {
  return (
    <View>
      <Text>SignIn</Text>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 text-lg bg-primary text-white px-4 py-2 rounded"
      >
        Create Account
      </Link>
    </View>
  );
};

export default SignIn;
