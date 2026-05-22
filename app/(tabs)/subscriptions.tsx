import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Subscriptions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return HOME_SUBSCRIPTIONS;
    }

    return HOME_SUBSCRIPTIONS.filter((subscription) =>
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
  }, [searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={
          <>
            <View className="subscriptions-header">
              <Text className="subscriptions-title">Subscriptions</Text>
              <Text className="subscriptions-count">
                {filteredSubscriptions.length} of {HOME_SUBSCRIPTIONS.length}
              </Text>
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
    </SafeAreaView>
  );
};

export default Subscriptions;
