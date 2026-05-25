import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import { icons } from "@/constants/icons";
import { useSubscriptions } from "@/src/context/subscriptions";
import dayjs from "dayjs";
import { useLocalSearchParams } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Subscriptions = () => {
  const { subscriptions, addSubscription } = useSubscriptions();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const posthog = usePostHog();
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const isUpcomingFilter = filter === "upcoming";
  const today = dayjs().startOf("day");
  const screenTitle = isUpcomingFilter
    ? "All Upcoming Subscriptions"
    : "Subscriptions";
  const listTitle = isUpcomingFilter
    ? "Upcoming Subscriptions"
    : "All Subscriptions";

  const visibleSubscriptions = useMemo(() => {
    const baseSubscriptions = isUpcomingFilter
      ? subscriptions
          .filter(
            (subscription) =>
              subscription.status === "active" &&
              subscription.renewalDate &&
              !dayjs(subscription.renewalDate).isBefore(today, "day"),
          )
          .sort(
            (first, second) =>
              dayjs(first.renewalDate).valueOf() -
              dayjs(second.renewalDate).valueOf(),
          )
      : subscriptions;
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return baseSubscriptions;
    }

    return baseSubscriptions.filter((subscription) =>
      [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.paymentMethod,
        subscription.status,
        subscription.billing,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [isUpcomingFilter, searchQuery, subscriptions, today]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={
          <>
            <View className="subscriptions-header">
              <View>
                <Text className="subscriptions-title">{screenTitle}</Text>
                <Text className="subscriptions-count">
                  {visibleSubscriptions.length} of{" "}
                  {isUpcomingFilter
                    ? subscriptions.filter(
                        (subscription) =>
                          subscription.status === "active" &&
                          subscription.renewalDate &&
                          !dayjs(subscription.renewalDate).isBefore(
                            today,
                            "day",
                          ),
                      ).length
                    : subscriptions.length}
                </Text>
              </View>
              <Pressable onPress={() => setCreateModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={
                isUpcomingFilter
                  ? "Search upcoming subscriptions"
                  : "Search subscriptions"
              }
              placeholderTextColor="rgba(0, 0, 0, 0.45)"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              className="subscriptions-search"
            />

            <ListHeading title={listTitle} />
          </>
        }
        data={visibleSubscriptions}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={
          <Text className="subscriptions-empty">No subscriptions found</Text>
        }
        keyboardShouldPersistTaps="handled"
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
            source: "subscriptions_screen",
          });
        }}
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
