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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getUserData, updateUserData } from '../../../../api/auth';


export default function ProfileScreen() {
  const [profileImageUri, setProfileImageUri] = useState("C:/Users/alter/projects/DSM/Frontend_Proyecto_Soluciones_Moviles/assets/images/user-icon.png");
  const [username, setUsername] = useState("");
  // const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [errName, setErrName] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidPhoto, setInvalidPhoto] = useState(false);

  const imageChanged = useRef(false);
  const dataOriginal = useRef({name: "", email: ""});

  useEffect( () => {
    getUserData()
      .then((data)=>{
        if(data.user.profile){
          setProfileImageUri(data.user.profile);
          setUsername(data.user.name);
          setEmail(data.user.email);
          dataOriginal.current.name = data.user.name;
          dataOriginal.current.email = data.user.email;

        }

      })
      .catch((err)=>{
        console.log(err);
      }) 
  },[]); 

  useEffect(() => {
    const reget = /(?=[^\s])/;
    setErrName(!reget.test(username) || username.length > 80);

  }, [username]);

  // Validación EMAIL
  useEffect(() => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexEmail.test(email)) {
      if (email) setInvalidEmail(true);
      return;
    }

    setInvalidEmail(false);
  }, [email]);


  const saveChanges = () => {
    //TODO: borrar console logs
      console.log(profileImageUri);
      console.log(dataOriginal.current.name);
      console.log(dataOriginal.current.email);

    if(!imageChanged.current && username == dataOriginal.current.name && email == dataOriginal.current.email){
      console.log("no se hicieron cambios");
      return;
    }
    const formData = new FormData();
    if(imageChanged.current){
        formData.append("image", {
            uri: profileImageUri,
            name: `${username.replace(" ","")}.png`,
            type: "image/png",
        });
    }
    if(username != dataOriginal.current.name){
        formData.append("username", username);
    }
    if(email != dataOriginal.current.email){
        formData.append("email", email);
    }

    updateUserData(formData)
      .then(() => {
        //Update
        console.log("cambios realizados!");
          dataOriginal.current.name = "";
          dataOriginal.current.email = "";
      })
      .catch((err)=>{
        console.log(err);
      })

      imageChanged.current = false;
  };

  const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true, 
          aspect: [4, 4], 
          quality: 1,
          shape: "oval",
          
      });
      
      if (!result.canceled) {
          const croppedImageUri = result.assets[0].uri;
          if(result.assets[0].fileSize){
            if(result.assets[0].fileSize > 50000) {
              setInvalidPhoto(true);
              return;
            }
          }
          if(!croppedImageUri.includes(".png")) {
            setInvalidPhoto(true);
            return;
          }
          setProfileImageUri(croppedImageUri);
          setInvalidPhoto(false);
          imageChanged.current = true;
      }
  };
    
  return (
    <View style={styles.safeArea}>
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
            {invalidPhoto && 
              <View style={[styles.errorBox, {paddingTop: 10, top:-10}]}>
                <Text style={styles.errorText}>La foto debe ser un PNG y de tamaño maximo de 50 KB</Text>
              </View>
            }

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
                {/* alias Field
                <Text style={styles.label}>Alias:</Text>
                <TextInput
                    style={styles.input}
                    value={alias}
                    placeholderTextColor={'#7F7F7F'}
                    //keyboardAppearance="dark" 
                    onChangeText={(text) => setAlias(text)}
                /> */}

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
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'stretch', // Ensures children stretch to full width
  },
  // --- Avatar Styles ---
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Makes the image circular
    marginBottom: 10,
    borderWidth: 5, // Optional: for a subtle border
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
    marginLeft: 5, // Align with the input padding
  },
  input: {
    height: 50,
    backgroundColor: '#2A2A2A',
    borderRadius: 12, // Rounded corners for the input box
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20, // Space between input boxes
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
});
