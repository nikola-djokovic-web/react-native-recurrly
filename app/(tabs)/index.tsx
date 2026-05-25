import ListHeading from "@/components/ListHeading";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";
import { useSubscriptions } from "@/src/context/subscriptions";

export default function App() {
  const { user } = useUser();
  const posthog = usePostHog();
  const router = useRouter();
  const { subscriptions, addSubscription } = useSubscriptions();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";
  const upcomingSubscriptions = useMemo(() => {
    const today = dayjs().startOf("day");

    return subscriptions
      .filter(
        (subscription) =>
          subscription.status === "active" &&
          subscription.renewalDate &&
          !dayjs(subscription.renewalDate).isBefore(today, "day"),
      )
      .map((subscription) => {
        const renewalDate = dayjs(subscription.renewalDate);

        return {
          ...subscription,
          daysLeft: renewalDate.startOf("day").diff(today, "day"),
          renewalTime: renewalDate.valueOf(),
        };
      })
      .sort((first, second) => first.renewalTime - second.renewalTime)
      .slice(0, 8);
  }, [subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">
                  {displayName.length > 20
                    ? `${displayName.substring(0, 20)}...`
                    : displayName}
                </Text>
              </View>
              <Pressable onPress={() => setCreateModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Total Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <ListHeading
                title="Upcoming"
                onActionPress={() =>
                  router.push({
                    pathname: "/subscriptions",
                    params: { filter: "upcoming" },
                  })
                }
              />
              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming subscriptions
                  </Text>
                }
                contentContainerStyle={{ paddingRight: 20 }}
              />
            </View>

            <ListHeading
              title="All Subscriptions"
              onActionPress={() => router.push("/subscriptions")}
            />
          </>
        }
        data={subscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isExpanding = expandedSubscriptionId !== item.id;
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              );
              if (isExpanding) {
                posthog.capture("subscription_expanded", {
                  subscription_id: item.id,
                  subscription_name: item.name,
                });
              }
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        extraData={expandedSubscriptionId}
        contentContainerClassName="pb-30"
      />
      <CreateSubscriptionModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={(subscription) => {
          addSubscription(subscription);
          posthog.capture("subscription_created", {
            subscription_id: subscription.id,
            subscription_name: subscription.name,
            category: subscription.category ?? null,
            frequency: subscription.frequency ?? null,
            price: subscription.price,
            currency: subscription.currency ?? null,
          });
        }}
      />
    </SafeAreaView>
  );
}
