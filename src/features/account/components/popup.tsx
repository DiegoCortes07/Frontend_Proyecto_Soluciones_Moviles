import { Modal as RNModal, ModalProps, KeyboardAvoidingView, View, StyleSheet, Pressable } from "react-native";

type Props = ModalProps & {
    isOpen: boolean,
    withInput?: boolean
    outsidePress?: () => void
}

export const Popup = ({ isOpen, withInput, outsidePress, children, ...rest}: Props) => {
    const content = withInput ? (
        <KeyboardAvoidingView
            style={styles.cointainer}
            behavior="height">
            {children}
        </KeyboardAvoidingView>
    ) : (

        <Pressable style={{ width:"100%", height:"100%"}} onPress={outsidePress}>
            <Pressable
                onPress={(e) => e.stopPropagation()} // evita cerrar al tocar dentro
            >
                {children}
            </Pressable>
        </Pressable>
    );

    return (
        <RNModal
            visible={isOpen}
            transparent
            animationType="fade"
            statusBarTranslucent
            {...rest}
        >
            {content}
        </RNModal>
    );
}

const styles = StyleSheet.create({
    cointainer: {
        
        justifyContent: "center", 
        flex:1, 
        alignItems:"center" 
    },
});
