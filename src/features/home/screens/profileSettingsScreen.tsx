import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  BackHandler,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateUserData } from '../../../../api/auth';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationAction, useNavigation } from '@react-navigation/native';
import { Popup } from '../../account/components/popup';

declare const window: any;
const defaultAvatar =
"https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-símbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=";

export default function ProfileScreen() {
  const navigator = useNavigation();
  const [username, setUsername] = useState("");
  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [profileImageUri, setProfileImageUri] = useState(defaultAvatar);

  const [errName, setErrName] = useState(false);
  const [errAlias, setErrAlias] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  
  const imageChanged = useRef(false);
  const dataOriginal = useRef({name: "", email: "", alias:""});
  const { user, token, refreshUser} = useAuth();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);
  const [notButtonBack, setNotButtonBack] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [navigationData, setNavigationData] = useState<Readonly<NavigationAction>>();

  useEffect(() => {
    const unsubscribe = navigator.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) {
        // If there are no unsaved changes, let the navigation proceed
        return;
      }
      // **Prevent default action** (navigation)
      e.preventDefault();
      setNotButtonBack(true);
      setOpenAlert(true);
      setNavigationData(e.data.action);
    });

    return unsubscribe; // Cleanup the listener
  }, [navigator, hasUnsavedChanges]);

  useEffect( () => {
    refreshUser();
    if(user){
      if(user.profilePhoto){
        setProfileImageUri(user.profilePhoto);
      }
      dataOriginal.current.name = user.username;
      dataOriginal.current.email = user.email;
      if(user.alias){
        dataOriginal.current.alias = user.alias;
        setAlias(user.alias);
      }
      setUsername(user.username);
      setEmail(user.email);
      setHasUnsavedChanges(false);
    }
  },[]); 

  useEffect(() => {
    const reget = /(?=[^\s])/;
    setErrName(!reget.test(username) || username.length > 80);
    if(!hasUnsavedChanges){
      setHasUnsavedChanges(username != dataOriginal.current.name);
    }
  }, [username]);

  useEffect(() => {
    const reget = /^\S+$/;
    setErrAlias(!reget.test(alias) && alias!="" || alias.length > 15);
    if(!hasUnsavedChanges){
      setHasUnsavedChanges(alias != dataOriginal.current.alias);
    }
  }, [alias]);

  // Validación EMAIL
  useEffect(() => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      if (email) setInvalidEmail(true);
      return;
    }
    if(!hasUnsavedChanges){
      setHasUnsavedChanges(email != dataOriginal.current.email);
    }
    setInvalidEmail(false);
  }, [email]);

  const discardChanges = (saved: boolean) => {

    setOpenAlert(false);
    if(saved){
      saveChanges();
    }
    if(notButtonBack){
      navigator.dispatch(navigationData as never);
    }else{
      navigator.navigate("Home" as never);
    }
  }

  const saveChanges = () => {
    //TODO: borrar console logs
    if(!hasUnsavedChanges){
      console.log("no se hicieron cambios");
      return;
    }
    const formData = new FormData();
    if(imageChanged.current){
      
      formData.append("image", {
        uri: profileImageUri,
        name: `${username.replace(" ","")}.jpg`,
        type: "image/jpg",
      });
    
    }
    if(username != dataOriginal.current.name){
        formData.append("username", username);
    }
    if(alias != dataOriginal.current.alias){
        formData.append("alias", alias);
    }
    if(email != dataOriginal.current.email){
        formData.append("email", email);
    }

    updateUserData(formData,token)
      .then(() => {
        //Update
        console.log("cambios realizados!");
        dataOriginal.current.name = username;
        dataOriginal.current.email = email;
        dataOriginal.current.alias = alias;
        imageChanged.current = false;
        setHasUnsavedChanges(false);
      })
      .catch((err)=>{
        console.log(err);
      })

  };

  const pickImage = async () => {
    try {
      console.log("Requesting media library permissions...");
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Permission status:", status);
      
      if (status !== "granted") {
        console.warn("Permission denied for media library");
        if (Platform.OS === "web") {
          window.alert("Se necesitan permisos para acceder a la galería");
        } else {
          Alert.alert("Permisos requeridos", "Se necesitan permisos para acceder a la galería");
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.8,
        shape: 'oval'
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Validar tamaño de imagen (máx 5MB)
        const maxSizeBytes = 5 * 1024 * 1024; // 5MB
        if (selectedImage.fileSize && selectedImage.fileSize > maxSizeBytes) {
          if (Platform.OS === "web") {
            window.alert("La imagen es demasiado grande. Máximo 5MB.");
          } else {
            Alert.alert("Error", "La imagen es demasiado grande. Máximo 5MB.");
          }
          return;
        }
        if (!selectedImage.fileName?.includes(".jpeg")) {
          if (Platform.OS === "web") {
            window.alert("La imagen debe ser en formato JPEG.");
          } else {
            Alert.alert("Error", "La imagen debe ser en formato JPEG.");
          }
          return;
        }
        imageChanged.current = true;
        setHasUnsavedChanges(true);
        setProfileImageUri(selectedImage.uri);
        
      }
    } catch (error) {
      console.error("Error picking image:", error);
      const errorMessage = (error as any)?.message || "Error al seleccionar la imagen";
      if (Platform.OS === "web") {
        window.alert(errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };
    
  return (
    <View style={styles.safeArea}>
      <Popup isOpen={openAlert} withInput={true}>
        <View style={styles.alertMenu}>
          <Text style={styles.alertText}>Desea descatar cambios?</Text>
          <View style={styles.rowCointainer}>
            <TouchableOpacity style={[styles.alertButton,{backgroundColor:'#10314bff',}]} onPress={()=> discardChanges(false)}>
                <Text style={styles.updateButtonText}>Descartar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.alertButton,{backgroundColor:'#007AFF',}]} onPress={()=> discardChanges(true)}>
                <Text style={styles.updateButtonText}>Guardar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Popup>
      <ScrollView>
       <View style={{ backgroundColor:"#007AFF", width:"100%", height:"20%"}}>
            <View style={[styles.avatarSection, {top: "60%"}] }>
                    <Image
                        source={{ uri: profileImageUri }} 
                        style={styles.profileImage}
                    />
                <TouchableOpacity onPress={pickImage}>
                    <Text style={styles.changePhotoButtonText}>Cambiar Foto</Text>
                </TouchableOpacity>
            </View>
       </View>
       <View style={[styles.container,{top:"13%"}]}>
          <TouchableOpacity
            onPress={() => {
              if(hasUnsavedChanges){
                setOpenAlert(true);
              }else{
                navigator.navigate("Home" as never);
              }
              }}
            style={styles.backButton}
            accessibilityLabel="volver"
          >
            <Icon name="chevron-left" size={18} color="#071428" />
          </TouchableOpacity>
            <View style={styles.inputGroup}>
            
                {/* Name Field */}
                <Text style={styles.label}>Nombre:</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    placeholderTextColor={'#7F7F7F'}
                    //keyboardAppearance="dark" 
                    onChangeText={(text) => setUsername(text)}
                />
                {errName && 
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>• El nombre debe ser entre 1 y 88 characters</Text>
                  </View>
                }
                {/* alias Field */}
                <Text style={styles.label}>Alias:</Text>
                <TextInput
                    style={styles.input}
                    value={alias}
                    placeholderTextColor={'#7F7F7F'}
                    //keyboardAppearance="dark" 
                    onChangeText={(text) => setAlias(text)}
                />
                {errAlias && 
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>• El Alias no debe tener espacios y tener un maximo de 15 characters</Text>
                  </View>
                }
                {/* Email Field */}
                <Text style={styles.label}>Email:</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    placeholderTextColor={'#7F7F7F'}
                    //keyboardAppearance="dark"
                    keyboardType="email-address"
                    onChangeText={(text) => setEmail(text)}
                />
                {invalidEmail && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>• Formato de email inválido.</Text>
                  </View>
                )}
                <Text style={styles.label}>La direccion email activa es: {dataOriginal.current.email}</Text>

            </View>
            
            {/* --- Update Button --- */}
            <TouchableOpacity style={styles.updateButton} onPress={saveChanges}>
                <Text style={styles.updateButtonText}>Guardar</Text>
            </TouchableOpacity>
       </View>

      </ScrollView>
    </View>
  );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
  rowCointainer: {
    flexDirection:'row',
    width: "90%",
    justifyContent: 'space-between',
    marginTop: 20
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'stretch',
  },
  // --- Avatar Styles ---
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#1DB954",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    top: -40
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, 
    marginBottom: 10,
    borderWidth: 5, 
    borderColor: "#ffff",
    backgroundColor: "#ffff"
  },
  changePhotoButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // --- Input Styles ---
  inputGroup: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 5,
    fontWeight: 'bold',
    marginLeft: 5, 
  },
  input: {
    height: 50,
    backgroundColor: '#2A2A2A',
    borderRadius: 12, 
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20, 
  },
  errorBox: {
    width: "100%",
    backgroundColor: "#ff000022",
    padding: 10,
    paddingTop: 35,
    top: -34,
    borderRadius: 8,
    zIndex:-1,
  },

  errorText: {
    color: "#ff8a8a",
    fontSize: 14,
  },
  // --- Button Styles ---
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertMenu: {
    marginTop: 8,
    backgroundColor: "#061a2a",
    borderRadius: 8,
    paddingVertical: 6,
    width: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    borderColor: "#133b63",
    borderWidth: 1,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
    alignContent: 'center',
    alignItems: "center"
  },
  alertButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    width: "42.3%",
    alignItems: 'center',
    margin: 10,
  },
  alertText:{
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 10,
    fontWeight: 'bold', 
    textAlign: 'center'
  }
});
