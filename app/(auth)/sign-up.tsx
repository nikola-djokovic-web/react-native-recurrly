import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SignUp = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Link
        href="/(auth)/sign-in"
        className="mt-4 text-lg bg-primary text-white px-4 py-2 rounded"
      >
        Already have an account? Sign In
      </Link>
    </View>
  );
};

export default SignUp;
