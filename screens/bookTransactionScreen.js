import {View,Text,StyleSheet, TouchableOpacity,TextInput,Image,KeyboardAvoidingView,ToastAndroid,Alert} from 'react-native'
import React from 'react'
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as Permissions from 'expo-permissions'
import db from '../config'
import firebase from 'firebase'
export default class TransactionScreen extends React.Component{
    constructor(){
        super()
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedData:'',
            buttonState:'normal',
            scannedBookId:'',
            scannedStudentId:''

        }
    }
    getCameraPermissions=async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions:status==='granted',
            buttonState:id,
            scanned:false,
        })
    }
    handleBarCodeScanned=async({type,data})=>{
        if(this.state.buttonState==='bookId'){
            this.setState({
                scanned:true,
                scannedBookId:data,
                buttonState:'normal'
            })
        }else if(this.state.buttonState==='studentId'){
            this.setState({
                scanned:true,
                scannedStudentId:data,
                buttonState:'normal'
            })
        }

        
    }
    handleTransaction=async()=>{
        var transactionType=await this.checkBookEligibility()
        if(!transactionType){
            Alert.alert("Book doesn't exist in the library")
            this.setState({
                scannedBookId:'',
                scannedStudentId:''
            })
        }
        else if(transactionType==='issue'){
            var isStudentEligible=await this.checkStudentEligibilityForBookIssue()
            if(isStudentEligible===true){
                this.initiateBookIssue();
                return Alert.alert('Book issued!')
            }
        }
        else{
            var isStudentEligible=await this.checkStudentEligibilityForBookReturn()
            if(isStudentEligible===true){
                this.initiateBookReturn()
                Alert.alert('Book returned')
            }
        }             
    }
    checkStudentEligibilityForBookIssue=async()=>{
        const studentRef=await db.collection('students').where('studentId','==',this.state.scannedStudentId).get()
        var isStudentEligible=''
        if(studentRef.docs.length==0){
            isStudentEligibile=false
            Alert.alert("Student doesn't exist in the database")
            this.setState({
                scannedBookId:'',
                scannedStudentId:''
                
            });
        }
        else{
            studentRef.docs.map((doc)=>{
                var student=doc.data()
                if(student.numberOfBooksIssued<2){
                    isStudentEligible=true
                }
                else{
                    isStudentEligible=false
                    Alert.alert('Student has already issued two books');
                    this.setState({
                        scannedBookId:'',
                        scannedStudentId:''
                        
                    });
                }
            })
        }
        return isStudentEligible
    }
    checkBookEligibility=async()=>{
        const bookRef=await db.collection('books').where('bookId','==',this.state.scannedBookId).get()
        var transactionType=''
        if(bookRef.docs.legth===0){
            transactionType=false
        }
        else{
            bookRef.docs.map((doc)=>{
                var book=doc.data()
                if(book.bookAvailibility===true){
                    transactionType='issue'
                }
                else{transactionType='return'}
            })
        }
        return transactionType
    }
    checkStudentEligibilityForBookReturn=async()=>{
        const transactionRef=await db.collection('transactions').where('bookId','==',this.state.scannedBookId).limit(1).get()
        var isStudentEligibile=''
        transactionRef.docs.map((doc)=>{
            var lastBookTranscation=doc.data()
            if(lastBookTranscation.studentId===this.state.scannedStudentId){
                isStudentEligibile=true
            }
            else{
                isStudentEligibile=false
                Alert.alert("This book wasn't issued by this student")
                this.setState({
                    scannedBookId:'',
                    scannedStudentId:''
                    
                });
            }
        })
        return isStudentEligibile
        
    }
    initiateBookIssue=async()=>{
        db.collection('transactions').add({
            studentId:this.state.scannedStudentId,
            bookId:this.state.scannedBookId,
            transactionType:'issue'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            bookAvailibility:false
        });
        db.collection('students').doc(this.state.scannedStudentId).update({
            numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
        });
        this.setState({
            scannedBookId:'',
            scannedStudentId:''
            
        });
    }
    initiateBookReturn=async()=>{
        db.collection('transactions').add({
            studentId:this.state.scannedStudentId,
            bookId:this.state.scannedBookId,
            transactionType:'return'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            bookAvailibility:true
        });
        db.collection('students').doc(this.state.scannedStudentId).update({
            numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
        });
        this.setState({
            scannedBookId:'',
            scannedStudentId:''
            
        })
    }
    render(){

        if(this.state.buttonState!=='normal'&& this.state.hasCameraPermissions===true){
            return(
                <BarCodeScanner onBarCodeScanned={this.state.scanned===true?undefined:this.handleBarCodeScanned} style={StyleSheet.absoluteFillObject}/>
            )
        }
        else if(this.state.buttonState==='normal'){

        return(
            <KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled>
                
            <View style={{flex:1,justifyContent:'center',alignItems:"center"}}>
                <View>
                    <Image source={require('../assets/booklogo.jpg')} style={{width:200,height:200}}/>
                    <Text style={{textAlign:'center',fontSize:30}}>
                        Wily
                    </Text>
               </View>
                <View style={styles.inputView}>
                    <TextInput style={styles.inputBox} placeholder={'Book ID'} onChangeText={(text)=>{
                        this.setState({
                            scannedBookId:text
                        })
                        
                    }} value={this.state.scannedBookId}/>
                    <TouchableOpacity style={styles.scanButton}onPress={()=>{this.getCameraPermissions('bookId')}}>
                        <Text style={styles.buttonText}>
                            Scan
                        </Text>
                    </TouchableOpacity>
               </View>
               <View style={styles.inputView}>
                    <TextInput style={styles.inputBox} placeholder={'Student ID'} onChangeText={(text)=>{
                        this.setState({
                            scannedStudentId:text
                        })
                        
                    }} value={this.state.scannedStudentId}/>
                    <TouchableOpacity style={styles.scanButton}onPress={()=>{this.getCameraPermissions('studentId')}}>
                        <Text style={styles.buttonText}>
                            Scan
                        </Text>
                    </TouchableOpacity>
               </View>
               <TouchableOpacity style={styles.submitButton} onPress={()=>{
                   this.handleTransaction()
               }}>
                   <Text style={styles.submitButtonText}>
                    Submit
                       </Text>
                   </TouchableOpacity>
            </View> 
            </KeyboardAvoidingView>
        )
            }
    }
}
const styles= StyleSheet.create({
    displayText:{
        fontSize:15,
        
    },
    scanButton:{
        backgroundColor:'skyblue',
        padding:10,
        margin:10
    },
    butttonText:{
        fontSize:15,
        textAlign:'center',
        marginTop:10
    },
    inputView:{
        flexDirection:'row',
        margin:20,
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    scanButton:{
        backgroundColor:'skyblue',
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0,
        justifyContent:'center',
        alignItems:'center',

    },
    submitButton:{
        backgroundColor:'yellow',
        width:100,
        height:50,
    },

    submitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:'bold',
        color:'black'
    }
})
