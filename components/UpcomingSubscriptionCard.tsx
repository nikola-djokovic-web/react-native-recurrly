import { formatCurrency } from "@/lib/utils";
import React from "react";
import { Image, Text, View } from "react-native";

const UpcomingSubscriptionCard = ({
  name,
  price,
  daysLeft,
  icon,
  currency,
  color,
}: UpcomingSubscriptionCardProps) => {
  return (
    <View
      className="upcoming-card"
      style={color ? { backgroundColor: color } : undefined}
    >
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" resizeMode="contain" />

        <View className="upcoming-copy">
          <Text className="upcoming-price" numberOfLines={1}>
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft > 1
              ? `${daysLeft} days left`
              : daysLeft === 1
                ? "Last day"
                : daysLeft === 0
                  ? "Due today"
                  : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} overdue`}
          </Text>
        </View>
      </View>

      <Text className="upcoming-name" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};

export default UpcomingSubscriptionCard;
