// Re-export animated background component
export { AnimatedIconBackground } from './AnimatedIconBackground';

// Available icons for backgrounds
export const BACKGROUND_ICONS = ['★', '♠︎', '♦︎', '♣︎', '♥︎'] as const;
export type BackgroundIcon = typeof BACKGROUND_ICONS[number];

/**
 * Usage Example:
 *
 * <AnimatedIconBackground
 *   icon="♥︎"               // The icon/character to display
 *   iconSize={20}           // Size of each icon
 *   gridSpacing={60}        // Space between icons
 *   iconColor="#2d2d2d"     // Icon color
 *   iconOpacity={0.1}       // Icon opacity (0-1)
 *   speed={4000}            // Animation duration in ms (lower = faster)
 *   backgroundColor="#FFB3D9"
 * />
 *
 * The component renders as an absolute positioned background.
 * Place it as the first child in your container, then render
 * your content on top.
 *
 * Example:
 * <View style={{ flex: 1 }}>
 *   <AnimatedIconBackground icon="♠︎" />
 *   <YourContent />
 * </View>
 */
