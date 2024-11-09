const pages= ["Shraddha_Kapoor","Hrithik_Roshan","Varun_Dhawan","Salman_Khan","Virat_Kohli"
    ,"Alia_Bhatt","Priyanka_Chopra","Amitabh_Bachchan","Ranveer_Singh",
    "Shahid_Kapoor","Sushant_Singh_Rajput","Deepika_Padukone","Karan_Johar",
"Vivek_Oberoi","Krrish","Anushka_Sharma","Being_Human_Foundation","Tiger_Shroff","A_Flying_Jatt",
"Kaabil","MS_Dhoni", "Bajrangi_Bhaijaan", "Main_Tera_Hero",
"Ranbir_Kapoor","Bachna_Ae_Haseeno", "Anupam_Kher", "Sunny_Deol","The_Kashmir_Files","Shah_Rukh_Khan",
"Rajkummar_Rao", "Om_Shanti_Om", "Aditya_Roy_Kapur","Ajay_Devgn","Akshay_Kumar",
"John_Abraham", "Sidharth_Malhotra", "Kiara_Advani", "Bhool_Bhulaiyaa"
 ]

const n=pages.length

export const generateSourceAndTargetPage=()=>{
    let source=pages[Math.floor(Math.random()*n)]
    let target=pages[Math.floor(Math.random()*n)]
    while(source===target){
        target=pages[Math.floor(Math.random()*n)]
    }
    return {source,target}
}
