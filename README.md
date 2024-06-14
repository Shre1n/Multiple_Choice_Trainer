# Multiple Choice Trainer

#### Contributor

- Tom Washington Estermann
- Fatlinda Islami
- Josephin Koch
- Robin Hahn


## External Server Starten und Nutzen

### Windows

#### Java Umgebungsvariable hinzufügen

1. Installieren Sie sich die aktuelle Java Version auf Ihrem Windows Rechner.
2. Öffnen Sie den Ordner, in dem Sie die Java jdk gespeichert haben.
3. Öffnen Sie nun die Umgebungsvariablen auf Ihrem Betriebssystem.
4. Unter dem Begriff **_Systemvariablen_** finden Sie die Option "Neu".
5. Legen Sie eine neue Systemvariable an mit dem Namen:
> JAVA_HOME
6. Der Wert der Variable ist der Verweis auf Ihren installations Pfad zur der zuvor gedownloadeten jdk
7. Drücken Sie nun auf "OK"
8. Sie finden unter den gespeicherten Variablen eine Variable mit dem Namen _Path_. Öffnen Sie diese.
9. Drücken Sie wieder auf "Neu".
10. Geben Sie folgendes ein:
> %JAVA_HOME%\bin

dieser Verweis zeigt nun auf die _bin_ Datei, wo Ihre Java Anwendung liegt.

Haben Sie das erledigt. Können wir zum nächsten Schritt übergehen.


#### Maven Umgebungsvariable hinzufügen

1. Installieren Sie sich die aktuellste Maven Version auf Ihrem Rechner.

[Maven download](https://maven.apache.org/download.cgi)

2. Gehen Sie wie eben vor. 

Nennen Sie die Umgebungsvariable 

> M2_HOME

und Verweisen damit wieder auf den Ordner der Maven Installation.

> %M2_HOME%\bin



### MacOS

MacOS bietet die Möglichkeit Umgebungsvariablen direkt im Terminal zu setzten.

#### Java Umgebungsvariable hinzufügen

1. Installieren Sie sich die neuste Version von Java.
2. Setzten Sie
> JAVA_HOME = "{path/ist/platzhalter}"

Beispiel:

> JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-13.0.1.jdk/Contents/Home"
PATH="${JAVA_HOME}/bin:${PATH}"
export PATH

#### Maven Umgebungsvariable hinzufügen

1. Installieren Sie sich Maven auf [Maven](https://maven.apache.org/download.cgi).
2. Downloaden Sie sich die Binary tar.gz archive.
3. Extrahieren Sie diese.
4. Geben Sie im Terminal ein

Beispiel:

> export M2_HOME="/Users/pankaj/Downloads/apache-maven-3.6.3"
PATH="${M2_HOME}/bin:${PATH}"
export PATH
>

Mehr unter [How to install maven on macos](https://www.digitalocean.com/community/tutorials/install-maven-mac-os)


Nun können Sie den Vertx Server, welcher sich im external_server/multiple_choice befindet starten.

```bash
./mvnw clean compile exec:java
```