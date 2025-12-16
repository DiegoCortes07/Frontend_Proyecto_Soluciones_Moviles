import { Modal as RNModal, ModalProps, KeyboardAvoidingView, View, StyleSheet } from "react-native";

type Props = ModalProps & {
    isOpen: boolean,
    withInput?: boolean
}

export const Popup = ({ isOpen, withInput, children, ...rest}: Props) => {
    const content = withInput ? (
        <KeyboardAvoidingView
            style={styles.cointainer}
            behavior="height">
        
        </KeyboardAvoidingView>
    ) : (
        <View style={styles.cointainer}>
            {children}
        </View>
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
        backgroundColor: "#00000036", 
        alignItems:"center" 
    },
});
