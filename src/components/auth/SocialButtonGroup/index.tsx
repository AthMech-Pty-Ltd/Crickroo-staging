import React from 'react';
import { View } from 'react-native';
import { Button } from '../../common/Button';
import GoogleIcon from '../../../assets/images/google-icon.svg';
import AppleIcon from '../../../assets/images/apple-icon.svg';
import { styles } from './styles';

interface SocialButtonGroupProps {
  onGoogle?: () => void;
  onApple?: () => void;
  googleLabel?: string;
  appleLabel?: string;
  showApple?: boolean;
}

export const SocialButtonGroup: React.FC<SocialButtonGroupProps> = ({
  onGoogle,
  onApple,
  googleLabel = 'CONTINUE WITH GOOGLE',
  appleLabel = 'CONTINUE WITH APPLE',
  showApple = true,
}) => {
  return (
    <View style={styles.container}>
      <Button
        label={googleLabel}
        onPress={onGoogle || (() => {})}
        style={styles.button}
        textStyle={styles.buttonText}
        leftIcon={<GoogleIcon width={20} height={20} />}
      />
      {showApple && (
        <Button
          label={appleLabel}
          onPress={onApple || (() => {})}
          style={styles.button}
          textStyle={styles.buttonText}
          leftIcon={<AppleIcon width={20} height={20} />}
        />
      )}
    </View>
  );
};
