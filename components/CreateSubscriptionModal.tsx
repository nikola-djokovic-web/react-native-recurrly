import { icons } from "@/constants/icons";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

const categoryOptions = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const frequencyOptions = ["Monthly", "Yearly", "Weekly"] as const;

const categoryMeta: Record<
  (typeof categoryOptions)[number],
  Pick<Subscription, "color" | "icon">
> = {
  Entertainment: { color: "#ff6b6b", icon: icons.netflix },
  "AI Tools": { color: "#b8d4e3", icon: icons.openai },
  "Developer Tools": { color: "#e8def8", icon: icons.github },
  Design: { color: "#b8e8d0", icon: icons.figma },
  Productivity: { color: "#ffd6a5", icon: icons.notion },
  Cloud: { color: "#c7d2fe", icon: icons.dropbox },
  Music: { color: "#bbf7d0", icon: icons.spotify },
  Other: { color: "#f6eecf", icon: icons.wallet },
};

const getRenewalDate = (frequency: string) => {
  const normalizedFrequency = frequency.toLowerCase();
  const now = dayjs();

  if (normalizedFrequency.includes("year")) {
    return now.add(1, "year").toISOString();
  }

  if (normalizedFrequency.includes("week")) {
    return now.add(1, "week").toISOString();
  }

  if (normalizedFrequency.includes("day")) {
    return now.add(1, "day").toISOString();
  }

  return now.add(1, "month").toISOString();
};

const createSubscriptionId = (name: string) => {
  const slug =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "subscription";

  return `${slug}-${Date.now()}`;
};

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] =
    useState<(typeof frequencyOptions)[number]>("Monthly");
  const [category, setCategory] =
    useState<(typeof categoryOptions)[number]>("Entertainment");
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const parsedPrice = Number(price);

    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    if (!price.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Enter a positive price.");
      return;
    }

    const now = dayjs().toISOString();
    const meta = categoryMeta[category];

    onCreate({
      id: createSubscriptionId(trimmedName),
      name: trimmedName,
      price: parsedPrice,
      frequency,
      category,
      status: "active",
      startDate: now,
      renewalDate: getRenewalDate(frequency),
      icon: meta.icon,
      billing: frequency,
      color: meta.color,
      currency: "USD",
    });
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="modal-overlay"
      >
        <View className="modal-container">
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable className="modal-close" onPress={handleClose}>
              <Text className="modal-close-text">x</Text>
            </Pressable>
          </View>

          <ScrollView
            className="modal-scroll"
            contentContainerClassName="modal-body"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-field">
              <Text className="modal-label">Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Netflix"
                placeholderTextColor="#8a8a8a"
                className="auth-input"
              />
            </View>

            <View className="auth-field">
              <Text className="modal-label">Price</Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="12.99"
                placeholderTextColor="#8a8a8a"
                keyboardType="decimal-pad"
                className="auth-input"
              />
            </View>

            <View className="auth-field">
              <Text className="modal-label">Frequency</Text>
              <View className="picker-row">
                {frequencyOptions.map((option) => {
                  const isSelected = frequency === option;

                  return (
                    <Pressable
                      key={option}
                      className={clsx(
                        "picker-option",
                        isSelected && "picker-option-active",
                      )}
                      onPress={() => setFrequency(option)}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          isSelected && "picker-option-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="auth-field">
              <Text className="modal-label">Category</Text>
              <View className="category-scroll">
                {categoryOptions.map((option) => {
                  const isSelected = category === option;

                  return (
                    <Pressable
                      key={option}
                      className={clsx(
                        "category-chip",
                        isSelected && "category-chip-active",
                      )}
                      onPress={() => setCategory(option)}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          isSelected && "category-chip-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {error ? <Text className="auth-error">{error}</Text> : null}

            <Pressable
              className="auth-button modal-submit"
              onPress={handleSubmit}
            >
              <Text className="auth-button-text">Create subscription</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
