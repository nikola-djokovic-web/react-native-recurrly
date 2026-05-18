import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/onboarding"
        className="mt-4 text-lg bg-primary text-white px-4 py-2 rounded"
      >
        Get Started
      </Link>
      <Link
        href="/(auth)/sign-in"
        className="mt-4 text-lg bg-primary text-white px-4 py-2 rounded"
      >
        Sign In
      </Link>
      <Link
        href="/(auth)/sign-up"
        className="mt-4 text-lg bg-primary text-white px-4 py-2 rounded"
      >
        Create Account
      </Link>
      <Link
        href="/subscriptions"
        className="mt-4 text-lg bg-primary text-white px-4 py-2 rounded"
      >
        Spotify Subscriptions
      </Link>
      <Link
        href="{{
          pathname: '/subscriptions/[id]',
          params: {id: 'claude'}
        }}"
        className="mt-4 text-lg bg-primary text-white px-4 py-2 rounded"
      >
        Claude Subscriptions
      </Link>
    </View>
  );
}
