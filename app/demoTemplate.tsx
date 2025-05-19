// // Inspiration: https://x.com/madebydaybreak/status/1823013129598435499
// // Lucide icons: https://lucide.dev/ -> depends on react-native-svg
// import { icons } from "lucide-react-native";
// import { MotiProps, MotiView } from "moti";
// import { motifySvg } from "moti/svg";
// import { Pressable } from "react-native";
// import Animated, {
//   FadeIn,
//   FadeOut,
//   LayoutAnimationConfig,
//   LinearTransition,
// } from "react-native-reanimated";

// // Types
// type LucideIconName = keyof typeof icons;
// type TabsPropsData = { icon: LucideIconName; label: string };
// type TabsProps = {
//   data: TabsPropsData[];
//   selectedIndex?: number;
//   onChange?: (index: number) => void;
//   activeColor?: string;
//   inactiveColor?: string;
//   activeBackgroundColor?: string;
//   inactiveBackgroundColor?: string;
// };
// type AnimatedIconProps = {
//   name: LucideIconName;
//   color?: string;
//   size?: number;
// } & MotiProps;

// // Constants
// const _spacing = 4;
// const layoutAnimation = LinearTransition.springify().damping(80).stiffness(200);
// const entering = FadeIn.springify().damping(80).stiffness(200);
// const exiting = FadeOut.springify().damping(80).stiffness(200);

// function AnimatedIcon({
//   name,
//   color = "#000",
//   size = 18,
//   ...rest
// }: AnimatedIconProps) {
//   // @ts-ignore
//   const LucideIcon = motifySvg(icons[name])();

//   return <LucideIcon color={color} size={size} {...rest} />;
// }

// export default function AnimatedTabs({
//   onChange,
//   selectedIndex = 0,
//   data,
//   activeColor = "#fff",
//   inactiveColor = "#999",
//   activeBackgroundColor = "#111",
//   inactiveBackgroundColor = "#ddd",
// }: TabsProps) {
//   return (
//     <Animated.View
//       style={{
//         flexDirection: "row",
//         gap: _spacing,
//       }}
//       layout={layoutAnimation}
//     >
//       {data.map((item, index) => {
//         const isSelected = index === selectedIndex;
//         return (
//           <MotiView
//             layout={layoutAnimation}
//             key={`${item.icon}-${index}`}
//             animate={{
//               backgroundColor: isSelected
//                 ? activeBackgroundColor
//                 : inactiveBackgroundColor,
//             }}
//             style={{
//               borderRadius: 8,
//               overflow: "hidden",
//             }}
//           >
//             <Pressable
//               style={{
//                 flexDirection: "row",
//                 gap: _spacing,
//                 justifyContent: "center",
//                 alignItems: "center",
//                 padding: _spacing * 3,
//               }}
//               onPress={() => {
//                 onChange?.(index);
//               }}
//             >
//               <AnimatedIcon
//                 name={item.icon}
//                 animate={{
//                   color: isSelected ? activeColor : inactiveColor,
//                 }}
//               />
//               {/* We don't want to animate the initial entering, so we're using LayoutAnimationConfig */}
//               <LayoutAnimationConfig skipEntering>
//                 {isSelected && (
//                   <Animated.Text
//                     entering={entering}
//                     exiting={exiting}
//                     style={{
//                       color: activeColor,
//                       fontWeight: "600",
//                     }}
//                   >
//                     {item.label}
//                   </Animated.Text>
//                 )}
//               </LayoutAnimationConfig>
//             </Pressable>
//           </MotiView>
//         );
//       })}
//     </Animated.View>
//   );
// }
