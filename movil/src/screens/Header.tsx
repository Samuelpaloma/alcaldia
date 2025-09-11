import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Header = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.mainHeader}>
      {/* Logo SENA a la izquierda */}
      <View style={styles.logoPlaceholder}>
        <Image
          source={require("../../assets/Logo-del-sena-Verde-300x300-1-removebg-preview 2.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Botón usuario a la derecha */}
      <TouchableOpacity style={styles.userButton} onPress={() => navigation.navigate('Config')}>
        <View style={styles.userIcon}>
          <Image
            source={require("../../assets/image 2.png")}
            style={styles.userIconImage}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(48, 105, 46, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flex: 1,
  },
  logoPlaceholder: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#30692E',
  },
  userButton: {
    padding: 5,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIconText: {
    fontSize: 20,
  },
  userIconImage: {
    width: 50,
    height: 50,
    borderRadius: 15,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
});