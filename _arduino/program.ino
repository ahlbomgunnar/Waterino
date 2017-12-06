
#define M1 2
#define M2 3
#define M3 4
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
  
  if (Serial.available() > 0) {
    
    String action = Serial.readString();
    Serial.flush();
    delay(500);

    char charPos = action.charAt(1);
    int pos = charPos;

    // If motor action
    if(action.startsWith("m")) {

      // If motor action == on
      if(action.indexOf("on") > 0) {
        switch(pos) {
          case 1:
            digitalWrite(M1, HIGH);
            break;
          case 2:
            digitalWrite(M2, HIGH);
            break;
          case 3:
            digitalWrite(M3, HIGH);
            break;
          default:
            break;
        }
      }

      // If motor action == off
      else if(action.indexOf("off") > 0) {
        switch(pos) {
          case 1:
            digitalWrite(M1, LOW);
            break;
          case 2:
            digitalWrite(M2, LOW);
            break;
          case 3:
            digitalWrite(M3, LOW);
            break;
          default:
            break;
        }
      } 

    } 

    else if(action.startsWith("s")) {
      switch(pos) {
        case 1:
          Serial.println(analogRead(S1));
          break;
        case 2:
          Serial.println(analogRead(S2));
          break;
        case 3:
          Serial.println(analogRead(S3));
          break;
        default:
          break;
      }
    } 

  }

}
