import React, { Component } from 'react'
import {Text,View,TouchableOpacity,TextInput,Image,StyleSheet,KeyboardAvoidingView, Keyboard, Alert}from 'react-native'
import firebase from 'firebase'
export class LoginScreen extends React.Component{
    constructor(){
        super()
        this.state={
            emailId:'',
            password:''
        }
    }
    login=async(emailId,password)=>{
        if(emailId&&password){
            try{
                const response=await firebase.auth().signInWithEmailAndPassword(emailId,password)
                if(response){
                    this.props.navigation.navigate('Transaction')
                }
            }
            catch(error){
                switch (error.code){
                    case 'auth/user-not-found':Alert.alert("User doesn't exist");break;
                    case 'auth/invalid-email':Alert.alert("Incorrect Email or Password");break;
                }
            }
        }
        else {
            Alert.alert('Enter email or password')
        }
    }
    render(){
        return(
            <KeyboardAvoidingView style={{alignItems:'center',marginTop:20}}> 
                <View style={{alignItems:'center',marginTop:20}}>
                    <Image style={{height:200,width:200,}}source={require('../assets/booklogo.jpg')}/>
                    <Text style={{textAlign:'center',fontSize:30}}>
                        Wily
                        </Text>
                    </View>
                    <View>
                        <TextInput style={styles.loginBox} placeholder={'abc@example.com'} keyboardType={'email-address'} onChangeText={(text)=>{
                            this.setState({
                                emailId:text
                            })
                        }}/>

                        <TextInput style={styles.loginBox} placeholder={'Enter password'} secureTextEntry={true} onChangeText={(text)=>{
                            this.setState({
                                password:text
                            })
                        }}/>
                        
                        </View>
                        <View>
                            <TouchableOpacity style={{height:30,width:90,borderWidth:1,marginTop:20,borederRadius:10,paddingTop:5}} onPress={()=>{this.login(this.state.emailId,this.state.password)}}>
                                <Text style={{textAlign:'center'}}>
                                    Login
                                    </Text>
                                </TouchableOpacity>
                            </View>
                </KeyboardAvoidingView>
        )
    }
    
}
const styles = StyleSheet.create({
    loginBox:
    {
      width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin:10,
    paddingLeft:10
    }
  })
  