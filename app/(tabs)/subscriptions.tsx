import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import { icons } from "@/constants/icons";
import { useSubscriptions } from "@/src/context/subscriptions";
import { usePostHog } from "posthog-react-native";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Subscriptions = () => {
  const { subscriptions, addSubscription } = useSubscriptions();
  const posthog = usePostHog();
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return subscriptions;
    }

    return subscriptions.filter((subscription) =>
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
  }, [searchQuery, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={
          <>
            <View className="subscriptions-header">
              <View>
                <Text className="subscriptions-title">Subscriptions</Text>
                <Text className="subscriptions-count">
                  {filteredSubscriptions.length} of {subscriptions.length}
                </Text>
              </View>
              <Pressable onPress={() => setCreateModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search subscriptions"
              placeholderTextColor="rgba(0, 0, 0, 0.45)"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              className="subscriptions-search"
            />

            <ListHeading title="All Subscriptions" />
          </>
        }
        data={filteredSubscriptions}
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
            category: subscription.category,
            frequency: subscription.frequency,
            price: subscription.price,
            currency: subscription.currency,
            source: "subscriptions_screen",
          });
        }}
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
