import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import ModalSelector from 'react-native-modal-selector';

const DatosTecnicoScreen = () => {
  const [nombre, setNombre] = useState("Julian David Naranjo Pascuas");
  const [nombreEditando, setNombreEditando] = useState(false); // 👈 controla si se está editando
  const [nombreTemp, setNombreTemp] = useState(nombre); // 👈 para cambios temporales

  const [correo, setCorreo] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [dependencia, setDependencia] = useState("");

  const navigation = useNavigation<any>();

  const especialidadesData = [
    { key: 0, label: 'Seleccionar especialidad', value: '' },
    { key: 1, label: 'Sistemas', value: 'Sistemas' },
    { key: 2, label: 'Electricidad', value: 'Electricidad' },
    { key: 3, label: 'Plomería', value: 'Plomería' },
    { key: 4, label: 'Carpintería', value: 'Carpintería' },
    { key: 5, label: 'Mantenimiento General', value: 'Mantenimiento General' },
    { key: 6, label: 'Aire Acondicionado', value: 'Aire Acondicionado' },
    { key: 7, label: 'Telecomunicaciones', value: 'Telecomunicaciones' },
  ];

  const dependenciasData = [
    { key: 0, label: 'Seleccionar dependencia', value: '' },
    { key: 1, label: 'Secretaría de Gobierno', value: 'Secretaría de Gobierno' },
    { key: 2, label: 'Secretaría de Hacienda', value: 'Secretaría de Hacienda' },
    { key: 3, label: 'Secretaría de Planeación', value: 'Secretaría de Planeación' },
    { key: 4, label: 'Secretaría de Obras Públicas', value: 'Secretaría de Obras Públicas' },
    { key: 5, label: 'Secretaría de Salud', value: 'Secretaría de Salud' },
    { key: 6, label: 'Secretaría de Educación', value: 'Secretaría de Educación' },
    { key: 7, label: 'Secretaría de Desarrollo Social', value: 'Secretaría de Desarrollo Social' },
    { key: 8, label: 'Sistemas e Informática', value: 'Sistemas e Informática' },
    { key: 9, label: 'Recursos Humanos', value: 'Recursos Humanos' },
    { key: 10, label: 'Almacén General', value: 'Almacén General' },
  ];

  // Valores actuales guardados (lado izquierdo del modal)
    const [correoActual] = useState("juliannaranjo58@alcaldia.gov.co");
    const [especialidadActual] = useState("Electricidad");
    const [dependenciaActual] = useState("Sena Industrial");

    // Control del modal
    const [modalVisible, setModalVisible] = useState(false);

  const handleConfirmar = () => {
    setNombre(nombreTemp); // actualizar nombre definitivo
    setNombreEditando(false); // volver al modo bloqueado
    Alert.alert("Éxito", "Se ha cambiado el nombre correctamente ✅");
  };

  const validarCorreoInstitucional = (correo: string) => {
    const regex = /^[a-zA-Z0-9._%+-]{3,}@alcaldia\.gov\.co$/;
    return regex.test(correo);
  };

  const verificarCambiosValidos = () => {
    const correoValido = correo !== correoActual && validarCorreoInstitucional(correo);
    const especialidadCambiada = especialidad !== especialidadActual && especialidad !== "";
    const dependenciaCambiada = dependencia !== dependenciaActual && dependencia !== "";
    
    return correoValido || especialidadCambiada || dependenciaCambiada;
  };

  // En tu componente, actualiza la variable hayCambios
  const hayCambios = verificarCambiosValidos();

  const handleCancelar = () => {
    setNombreTemp(nombre); // restaurar valor anterior
    setNombreEditando(false);
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.volver}>◀ VOLVER</Text>
      </TouchableOpacity>

      {/* Contenedor Verde */}
      <View style={styles.card}>
        <Text style={styles.title}>Datos del Técnico</Text>
        
        {/* Nombre */}
        <Text style={styles.label}>Nombre:</Text>
        
        {/* Contenedor táctil mejorado */}
        <TouchableOpacity
            style={styles.inputTouchArea}
            activeOpacity={0.7}
            onPress={() => {
            console.log('Input presionado'); // Para debug
            setNombreEditando(true);
            }}
            disabled={nombreEditando} // No interceptar si ya está editando
        >
            <TextInput
            style={[
                styles.input,
                !nombreEditando && { opacity: 0.5 },
            ]}
            value={nombreTemp}
            onChangeText={setNombreTemp}
            editable={nombreEditando}
            onPress={() => {
                console.log('Input enfocado'); // Para debug
                setNombreEditando(true);
            }}
            onBlur={() => {
                // Opcional: auto-cancelar si sale del input sin confirmar
                // handleCancelar();
            }}
            // Mejoras para móvil
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={() => {
                if (nombreTemp !== nombre) {
                handleConfirmar();
                }
            }}
            />
        </TouchableOpacity>
        
        {/* Botones debajo del input (solo si está editando) */}
        {nombreEditando && (
            <View style={styles.buttonsRow}>
            <TouchableOpacity
                style={[
                styles.confirmarBtn,
                nombreTemp === nombre && { backgroundColor: "gray" },
                ]}
                disabled={nombreTemp === nombre}
                onPress={handleConfirmar}
                activeOpacity={0.7} // Feedback visual
            >
                <Text style={styles.btnText}>CONFIRMAR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.cancelarBtn} 
                onPress={handleCancelar}
                activeOpacity={0.7} // Feedback visual
            >
                <Text style={styles.btnText}>CANCELAR</Text>
            </TouchableOpacity>
            </View>
        )}

        {/* Correo */}
        <Text style={styles.label}>Correo Institucional:</Text>
        <TextInput
          style={styles.input}
          value={correoActual}
          onChangeText={setCorreo}
          editable={false}
        />

        {/* Especialidad */}
        <Text style={styles.label}>Especialidad</Text>
        <TextInput
          style={styles.input}
          value={especialidadActual}
          onChangeText={setEspecialidad}
          editable={false}
        />

        {/* Dependencia */}
        <Text style={styles.label}>Dependencia</Text>
        <TextInput
          style={styles.input}
          value={dependenciaActual}
          onChangeText={setDependencia}
          editable={false}
        />

        {/* Botón Cambiar */}
        <TouchableOpacity style={styles.cambiarBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnText}>CAMBIAR</Text>
        </TouchableOpacity>

      </View>

      {/* Logo SENA */}
      <Image
        source={require("../../assets/Logo-del-sena-Verde-300x300-1-removebg-preview 2.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>CONFIRMAR CAMBIOS</Text>

            {/* Correo */}
            <Text style={styles.label}>Correo Institucional:</Text>

            <View style={styles.modalRow}>
              <View style={styles.modalCol}>
                <Text style={styles.colHeader}>Actual</Text>
                <Text style={styles.modalLeft}>
                  {correoActual}
                </Text>
              </View>

              <View style={styles.modalCol}>
                <Text style={styles.colHeader}>Nuevo</Text>
                <TextInput
                  style={[
                    styles.modalRightInput,
                    validarCorreoInstitucional(correo) && correo !== correoActual && { 
                      borderColor: "green", 
                      backgroundColor: "#eafaea" 
                    },
                    correo !== "" && !validarCorreoInstitucional(correo) && { 
                      borderColor: "red", 
                      backgroundColor: "#ffeaea" 
                    }
                  ]}
                  placeholder="Nuevo correo"
                  value={correo}
                  onChangeText={setCorreo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {correo !== "" && !validarCorreoInstitucional(correo) && (
                  <Text style={styles.errorText}>
                    El correo debe terminar con @alcaldia.gov.co
                  </Text>
                )}
              </View>
            </View>

            {/* Especialidad */}
            <Text style={styles.label}>Especialidad:</Text>

            <View style={styles.modalRow}>
              <View style={styles.modalCol}>
                <Text style={styles.colHeader}>Actual</Text>
                <Text style={styles.modalLeft}>
                  {especialidadActual}
                </Text>
              </View>

              <View style={styles.modalCol}>
                <Text style={styles.colHeader}>Nuevo</Text>
                <View style={[
                  styles.pickerContainer,
                  especialidad && especialidad !== "" && especialidad !== especialidadActual && { 
                    borderColor: "green", 
                    backgroundColor: "#eafaea" 
                  }
                ]}>
                  <ModalSelector
                    data={especialidadesData}
                    initValue={especialidad || "Seleccionar"}
                    onChange={(option) => setEspecialidad(option.value)}
                    style={styles.modalSelectorStyle}
                    selectStyle={styles.selectStyle}
                    selectTextStyle={styles.selectTextStyle}
                    optionStyle={styles.optionStyle}
                    optionTextStyle={styles.optionTextStyle}
                    cancelStyle={styles.cancelStyle}
                    cancelTextStyle={styles.cancelTextStyle}
                    overlayStyle={styles.overlayStyle}
                    cancelText="Cancelar"
                    animationType="fade"
                  />
                </View>
              </View>
            </View>

            {/* Dependencia */}
            <Text style={styles.label}>Dependencia:</Text>

            <View style={styles.modalRow}>
              <View style={styles.modalCol}>
                <Text style={styles.colHeader}>Actual</Text>
                <Text style={styles.modalLeft}>
                  {dependenciaActual}
                </Text>
              </View>

              <View style={styles.modalCol}>
                <Text style={styles.colHeader}>Nuevo</Text>
                <View style={[
                  styles.pickerContainer,
                  dependencia && dependencia !== "" && dependencia !== dependenciaActual && { 
                    borderColor: "green", 
                    backgroundColor: "#eafaea" 
                  }
                ]}>
                  <ModalSelector
                    data={dependenciasData}
                    initValue={dependencia || "Seleccionar"}
                    onChange={(option) => setDependencia(option.value)}
                    style={styles.modalSelectorStyle}
                    selectStyle={styles.selectStyle}
                    selectTextStyle={styles.selectTextStyle}
                    optionStyle={styles.optionStyle}
                    optionTextStyle={styles.optionTextStyle}
                    cancelStyle={styles.cancelStyle}
                    cancelTextStyle={styles.cancelTextStyle}
                    overlayStyle={styles.overlayStyle}
                    cancelText="Cancelar"
                    animationType="fade"
                  />
                </View>
              </View>
            </View>

            {/* Botones del modal */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelarBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>CANCELAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSolicitarBtn,
                  !hayCambios && { backgroundColor: "rgb(128, 128, 128)", opacity: 0.6 }
                ]}
                disabled={!hayCambios}
                onPress={() => {
                  Alert.alert("Solicitud enviada", "Tus cambios han sido solicitados ✅");
                  setModalVisible(false);
                }}
              >
                <Text style={[
                  styles.btnText,
                  !hayCambios && { color: "#666666" }
                ]}>
                  SOLICITAR CAMBIOS
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    gap: 25,
  },
  volver: {
    fontSize: 16,
    color: "black",
    alignSelf: "flex-start",
  },
  card: {
    backgroundColor: "#b6c8b0",
    padding: 20,
    width: "100%",
    alignSelf: "stretch",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  confirmarBtn: {
    flex: 1,
    backgroundColor: "green",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginRight: 5,
  },
  inputTouchArea: {
    minHeight: 44, // Área mínima táctil recomendada por Apple (44pt)
    justifyContent: 'center',
  },
  cancelarBtn: {
    flex: 1,
    backgroundColor: "red",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginLeft: 5,
  },
  cambiarBtn: {
    backgroundColor: "darkgreen",
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    alignItems: "center",
    textAlign: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginTop: 30,
    alignSelf: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    },
    modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 420,
    borderRadius: 10,
    padding: 16,
    },
    modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    alignItems: "center",
    marginBottom: 12,
    },
    modalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
    },
    modalCol: {
    flex: 1,
    },
    colHeader: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    },
    modalLeft: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 6,
    color: "#000",
    justifyContent: 'center', // Para centrar el texto verticalmente
    minHeight: 30, // Altura mínima consistente
    },
    modalRightInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    },
    oldValue: {
    fontSize: 14,
    height: 40,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#eee",
    color: "#000",
    },
    pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: 'hidden', // Para mantener el borderRadius
},
    pickerStyle: {
        height: 50, // ✅ Altura correcta
        width: '100%',
        color: '#333',
    },
    newValue: {
    fontSize: 14,
    height: 40,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#eafaea",
    color: "green",
    },
    modalButtonsRow: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
    },
    modalCancelarBtn: {
    flex: 1,
    backgroundColor: "red",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    },
    modalSolicitarBtn: {
    flex: 1,
    backgroundColor: "green",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
      fontStyle: 'italic'
    },
    modalSelectorStyle: {
      flex: 1,
    },
    selectStyle: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: '#fff',
      minHeight: 45,
      justifyContent: 'center',
    },
    
    selectTextStyle: {
      fontSize: 16,
      color: '#333',
    },
    
    optionStyle: {
      backgroundColor: '#fff',
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    
    optionTextStyle: {
      fontSize: 16,
      color: '#333',
    },
    
    cancelStyle: {
      backgroundColor: '#f8f8f8',
      paddingVertical: 15,
      paddingHorizontal: 20,
    },
    
    cancelTextStyle: {
      fontSize: 16,
      color: '#007AFF',
      textAlign: 'center',
      fontWeight: '600',
    },
    
    overlayStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

export default DatosTecnicoScreen;