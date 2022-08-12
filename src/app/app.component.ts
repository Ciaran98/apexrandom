import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { HttpClient} from '@angular/common/http'
import apexdata from '../assets/apexdata.json';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebaseConfig from "../config/FirebaseConfig.json"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries




// Initialize Firebase
const app = initializeApp(firebaseConfig);
declare var $: any;

interface Weapon{
  "Name":string,
  "Ammo Type":string,
  "Optic Class":string,
  "Image":string
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  public constructor(private http:HttpClient, private renderer: Renderer2){
  }
  title = 'apexrandom';
  public character="No Character";
  public characterdeets={
    "Real Name":"No Character Selected",
    "Tagline":"Press Randomise to Start",
    "Tactical Ability":"No Character",
    "Passive Ability":"No Character",
    "Ultimate Ability":"No Character"
  };
  // Variables for all Weapon related things
  public weap1:Weapon=apexdata["Weapon Data"]["P2020"];
  public weap2:Weapon=apexdata["Weapon Data"]["P2020"];
  public optic1=apexdata["Optics"][this.weap1["Optic Class"]][0];
  public optic2=apexdata["Optics"][this.weap2["Optic Class"]][0];
  public optic1rarity="";
  public optic2rarity="";
  private weaponsMap = new Map<string,Weapon>([["Weapon 1",this.weap1],["Weapon 2",this.weap2]]);
  private opticsMap = new Map<string,string>([["Weapon 1",this.optic1],["Weapon 2", this.optic2]]);
  // Variables for all Map related things
  public currentdrop="No Drop Point";
  public map="";
  @ViewChild('stormpoint') divStormpoint!: ElementRef;
  @ViewChild('kingscanyon') divKingscanyon!: ElementRef;
  @ViewChild('olympus') divOlympus!: ElementRef;
  @ViewChild('characterscreen') divCharacter!: ElementRef;
  @ViewChild('weaponsscreen') divWeapons!: ElementRef;
  @ViewChild('charinfo') divCharinfo!: ElementRef;
  @ViewChild('worldsedge') divWorldsEdge!: ElementRef;
  // On initalisation, will get current map from api, set the map on HTML to display:flex, and starts image mapster on the current map.
  ngOnInit(){
    this.http.get<string>("https://api.mozambiquehe.re/maprotation?auth=ab73839d178bb037221d347ccc73dfa5").subscribe(data=>{
    this.map = data["current"]["map"];
    if(this.map === "Storm Point"){
      this.renderer.setStyle(this.divStormpoint.nativeElement,"display","flex");
    }
    else if(this.map === "Kings Canyon"){
      this.renderer.setStyle(this.divKingscanyon.nativeElement,"display","flex");
    }
    else if(this.map === "Olympus"){
      this.renderer.setStyle(this.divOlympus.nativeElement,"display","flex");
    }
    else if(this.map === "World's Edge"){
      this.renderer.setStyle(this.divWorldsEdge.nativeElement,"display","flex");
    }
    this.InitMapster();
  },error =>{
    console.error("Failed to load map rotation")
    this.map = "Kings Canyon";
    this.renderer.setStyle(this.divKingscanyon.nativeElement,"display","flex");
    this.InitMapster();
  });
}
// Initialise Image Mapster
public InitMapster(){
  $("#"+this.map.replace("'","").toLowerCase().split(' ').join('')).mapster({
    fillColor: "99ccff",
    fillOpacity: 0.2,
    staticState:false,
    render_highlight:{
      fill:false,
      stroke:false,
    },
    stroke:true,
    strokeColor: '4981b8',
    strokeWidth:2,
  });
}
// Randomises all fields
public randomiser(){
  // Play animation fade-out for hiding randomisation transition
  this.renderer.setStyle(this.divCharacter.nativeElement,"animation-name","fadeout");
  this.renderer.setStyle(this.divCharacter.nativeElement,"animation-duration",".3s");
  this.renderer.setStyle(this.divCharacter.nativeElement,"animation-fill-mode","forwards");
  this.renderer.setStyle(this.divWeapons.nativeElement,"animation-name","fadeout");
  this.renderer.setStyle(this.divWeapons.nativeElement,"animation-duration",".3s");
  this.renderer.setStyle(this.divWeapons.nativeElement,"animation-fill-mode","forwards");
  setTimeout(() =>{
    this.randChar();
    this.randLoadout();
  },250);
  this.randDropPoint();
  setTimeout(() =>{
    // Play animation fade-in after certain amout of time
    this.renderer.setStyle(this.divCharinfo.nativeElement,"display","block");
    this.renderer.setStyle(this.divCharacter.nativeElement,"animation-name","fadein");
    this.renderer.setStyle(this.divCharacter.nativeElement,"animation-duration",".4s");
    this.renderer.setStyle(this.divWeapons.nativeElement,"animation-name","fadein");
    this.renderer.setStyle(this.divWeapons.nativeElement,"animation-duration",".4s");
    this.renderer.setStyle(this.divCharinfo.nativeElement,"border-color",this.characterdeets["Color"]);
  },500)
  
}

//Generate a random loadout
private randLoadout(){
  this.generateWeapon("Weapon 1");
  this.weap1 = this.weaponsMap.get("Weapon 1")!;
  this.generateWeapon("Weapon 2");
  this.weap2 = this.weaponsMap.get("Weapon 2")!;
  this.generateOptics("Weapon 1");
  this.optic1 = this.opticsMap.get("Weapon 1")!;
  this.optic1rarity = this.determineOpticRarity(this.optic1);
  this.generateOptics("Weapon 2");
  this.optic2 = this.opticsMap.get("Weapon 2")!;
  this.optic2rarity = this.determineOpticRarity(this.optic2);
  
}
// Randomly select a character, will use recursion to not generate the same character twice
private randChar(){
  var currentCharacter = this.character;
  this.character = apexdata["Legends"][Math.floor(Math.random() * (apexdata["Legends"].length))];
  if(currentCharacter == this.character){
    this.randChar();
  }
  this.characterdeets = apexdata["Legend Details"][this.character];
}
// Generate a random drop point from the current map, will use recursion if the drop point is the same as the previously generated drop point
private randDropPoint(){
  var previousdrop = this.currentdrop;
  if(previousdrop != ""){
    $("#"+previousdrop.split(' ').join('').toLowerCase()).mapster("deselect");
  }
  this.currentdrop = apexdata["Maps"][this.map][Math.floor(Math.random() * (apexdata["Maps"][this.map].length))];
  if(this.currentdrop.split(' ').join('').toLowerCase() == previousdrop.split(' ').join('').toLowerCase()){
    this.randDropPoint();
    return;
  }
  $("#"+this.currentdrop.split(' ').join('').toLowerCase()).mapster("select");
}
//Generate a random weapon, will use recursion to re-generate weapon if it is of the same type as the weapon in the other slot.
private generateWeapon(weaponNumber:string){
  // V2.0
  let randWeaponName = apexdata["Weapon"][Math.floor(Math.random() * (apexdata["Weapon"].length))];
  let randWeaponData = apexdata["Weapon Data"][randWeaponName];
  if(randWeaponName == this.weaponsMap.get("Weapon 1")?.Name || randWeaponName == this.weaponsMap.get("Weapon 2")?.Name){
    this.generateWeapon(weaponNumber)
    return;
  }
  this.weaponsMap.set(weaponNumber,randWeaponData)
}
// Generate a random optic
private generateOptics(weaponNumber:string){
  let randomOptic = apexdata["Optics"][this.weaponsMap.get(weaponNumber)?.['Optic Class']!][Math.floor(Math.random() * (apexdata["Optics"][this.weaponsMap.get(weaponNumber)?.['Optic Class']!].length))];
  if((this.weaponsMap.get(weaponNumber)?.Name == "BOCEK COMPOUND BOW" && randomOptic == "2x-4x Variable AOG")){
    this.generateOptics(weaponNumber);
    return;
  }
  this.opticsMap.set(weaponNumber,randomOptic);
  
}
// Determine the rarity of the randomised optic
private determineOpticRarity(optic:string){
  if(optic == "1x HCOG 'Classic'" || optic == "1x Holo"){
    return "common";
  }
  else if(optic == "2x HCOG 'Bruiser'" || optic == "1x-2x Variable Holo" || optic == "6x Sniper"){
    return "rare";
  }
  else if(optic == "3x HCOG 'Ranger'" || optic == "2x-4x Variable AOG" || optic == "4x-8x Variable Sniper"){
    return "epic";
  }
  else if(optic == "1x Digital Threat" || optic == "4x-10x Digital Sniper Threat"){
    return "legendary";
  }
  return "none";
}
}