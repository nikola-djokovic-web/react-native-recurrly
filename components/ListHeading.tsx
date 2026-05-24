import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ListHeading = ({
  title,
  actionLabel = "View All",
  onActionPress,
}: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>
      {onActionPress ? (
        <TouchableOpacity className="list-action" onPress={onActionPress}>
          <Text className="list-action-text">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default ListHeading;
