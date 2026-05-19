import "@/global.css";
import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-5xl font-sans-extrabold">Home</Text>
      <Link
        href="/onboarding"
        className="mt-4 font-sans-bold text-lg bg-primary text-white px-4 py-2 rounded"
      >
        Get Started
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="mt-4 font-sans-bold text-lg bg-primary text-white px-4 py-2 rounded"
      >
        Sign In
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 font-sans-bold text-lg bg-primary text-white px-4 py-2 rounded"
      >
        Create Account
      </Link>
    </SafeAreaView>
  );
}
