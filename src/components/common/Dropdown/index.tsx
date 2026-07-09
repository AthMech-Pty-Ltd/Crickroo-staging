import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  StyleProp,
  Modal,
  FlatList,
  View,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { CaretDownIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Select',
  options,
  selectedValue,
  onSelect,
  style,
  triggerStyle,
  leftIcon,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<any>(null);

  const handleOpen = () => {
    if (options.length === 0) return;
    containerRef.current?.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        const spaceBelow = SCREEN_HEIGHT - (y + height);
        const isAbove = spaceBelow < 250;
        setDropdownPosition({
          top: isAbove ? y - 250 : y + height,
          left: x,
          width: width,
        });
        setIsVisible(true);
      },
    );
  };

  const handleSelect = (item: string) => {
    onSelect(item);
    setIsVisible(false);
  };

  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        ref={containerRef}
        style={[styles.container, triggerStyle]}
        onPress={handleOpen}
      >
        <View style={styles.triggerLeft}>
          {leftIcon}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.text, !selectedValue && styles.placeholder]}
          >
            {selectedValue || placeholder}
          </Text>
        </View>
        <CaretDownIcon size={16} color={colors.neutrals[40]} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={isVisible}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                },
              ]}
            >
              <FlatList
                data={options}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      item === selectedValue && styles.selectedOption,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        styles.optionText,
                        item === selectedValue && styles.selectedOptionText,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
