
#define M1 13
#define M2 12
#define M3 11
#define S1 0
#define S2 1
#define S3 2

void setup(void) {

  Serial.begin(9600);
  pinMode(M1, OUTPUT);
  pinMode(M2, OUTPUT);
  pinMode(M3, OUTPUT);
  pinMode(S1, INPUT);
  pinMode(S2, INPUT);
  pinMode(S3, INPUT);
  Serial.flush();

}


void loop(void) {
  delay(100);
  if (Serial.available() > 0) {
    
    String action = Serial.readString();
    Serial.flush();

    char charPos = action.charAt(1);
    int pos = charPos;

    // If motor action
    if(action.startsWith("m")) {
      // If motor action == on
      if(action.indexOf("on") > 0) {
        switch(pos) {
          case 49:
            digitalWrite(M1, HIGH);
            break;
          case 50:
            digitalWrite(M2, HIGH);
            break;
          case 51:
            digitalWrite(M3, HIGH);
            break;
          default:
            Serial.println("Not a valid position");
            break;
        }
      }

      // If motor action == off
      else if(action.indexOf("off") > 0) {
        switch(pos) {
          case 49:
            digitalWrite(M1, LOW);
            break;
          case 50:
            digitalWrite(M2, LOW);
            break;
          case 51:
            digitalWrite(M3, LOW);
            break;
          default:
            Serial.println("Not a valid position");
            break;
        }
      } 

    } 

    else if(action.startsWith("s")) {
      switch(pos) {
        case 49:
          Serial.println(analogRead(S1));
          break;
        case 50:
          Serial.println(analogRead(S2));
          break;
        case 51:
          Serial.println(analogRead(S3));
          break;
        default:
          Serial.println("Invalid position");
          break;
      }
    } 
    else {
      Serial.println("Does not start with m or s"); 
    }

  }

}
