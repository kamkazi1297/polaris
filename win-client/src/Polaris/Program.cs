namespace Polaris;

static class Program
{
    [STAThread]
    static void Main()
    {
        try
        {
            Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
            Application.ThreadException += (_, e) => ShowCrash(e.Exception);
            AppDomain.CurrentDomain.UnhandledException += (_, e) =>
            {
                if (e.ExceptionObject is Exception ex) ShowCrash(ex);
            };
            ApplicationConfiguration.Initialize();
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            var dir = AppContext.BaseDirectory;
            if (LooksPacked(dir))
            {
                MessageBox.Show(
                    "Polaris را از داخل فایل ZIP اجرا نکنید." + Environment.NewLine + Environment.NewLine +
                    "کل پوشه را Extract کنید، بعد Start-Polaris.bat را بزنید." + Environment.NewLine +
                    "بهتر: فایل Polaris-Setup.exe را نصب کنید.",
                    "Polaris",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
            }

            Paths.Ensure();
            File.AppendAllText(Path.Combine(Paths.Root, "launch.log"), DateTime.Now + " start " + dir + Environment.NewLine);
            Application.Run(new MainForm());
        }
        catch (Exception ex)
        {
            ShowCrash(ex);
        }
    }

    static bool LooksPacked(string dir)
    {
        return dir.Contains(@"\Temp\", StringComparison.OrdinalIgnoreCase)
            || dir.Contains(@"AppData\Local\Temp", StringComparison.OrdinalIgnoreCase)
            || dir.Contains(@"\INetCache\", StringComparison.OrdinalIgnoreCase)
            || dir.Contains(@"\Zip", StringComparison.OrdinalIgnoreCase);
    }

    static void ShowCrash(Exception ex)
    {
        try
        {
            Paths.Ensure();
            var path = Path.Combine(Paths.Root, "crash.log");
            File.WriteAllText(path, DateTime.Now + Environment.NewLine + ex);
            MessageBox.Show(
                "پولاریس باز نشد." + Environment.NewLine + Environment.NewLine +
                ex.Message + Environment.NewLine + Environment.NewLine +
                "جزئیات خطا در:" + Environment.NewLine + path,
                "Polaris",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
        catch
        {
            MessageBox.Show(ex.ToString(), "Polaris");
        }
    }
}
