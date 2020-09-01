import java.io.*;

public class Foo {
  public static void main(String[] args) {
    System.out.println("Hello, <%= participantName %>!");

    try {
      BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
      String name = reader.readLine();

      // Printing the read line
      System.out.println("Hi " + name);
    } catch (IOException ioe) {
    }
  }
}