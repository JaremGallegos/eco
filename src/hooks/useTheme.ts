import {
  BorderRadius,
  Colors,
  Gradients,
  Shadows,
  Spacing,
  Typography
} from '@/constants/theme';
import {
  buttonStyles,
  cardStyles,
  coloredShadow,
  getServiceBackgroundColor,
  getServiceColor,
  getServiceIcon,
  getSeverityColor,
  getSeverityIcon,
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  inputStyles,
  severityBadgeStyles,
  statusBadgeStyles,
  withOpacity,
} from '@/src/utils/styles';
import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';


  const theme = isDark ? Colors.dark : Colors.light;

  return {

    colors: {
      ...Colors,
      theme,
    },


    spacing: Spacing,


    borderRadius: BorderRadius,


    shadows: Shadows,


    typography: Typography,


    gradients: Gradients,


    utils: {
      getStatusColor,
      getStatusIcon,
      getStatusLabel,
      getSeverityColor,
      getSeverityIcon,
      getServiceColor,
      getServiceBackgroundColor,
      getServiceIcon,
      withOpacity,
      coloredShadow,
    },


    presets: {
      statusBadge: statusBadgeStyles,
      severityBadge: severityBadgeStyles,
      card: cardStyles,
      button: buttonStyles,
      input: inputStyles,
    },


    isDark,
    colorScheme,
  };
};
