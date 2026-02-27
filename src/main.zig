const std = @import("std");
const Io = std.Io;

const trail = @import("trail");

pub fn main(init: std.process.Init) !void {
    const io = init.io;
    const arena = init.arena;
    std.debug.print("All your {s} are belong to us.\n", .{"codebase"});

    const args = try init.minimal.args.toSlice(arena);
    for (args) |arg| {
        std.log.info("arg: {s}", .{arg});
    }

    var stdout_buffer: [1024]u8 = undefined;
    var stdout_file_writer: Io.File.Writer = .init(.stdout(), io, &stdout_buffer);
    const stdout_writer = &stdout_file_writer.interface;

    try trail.printAnotherMessage(stdout_writer);

    try stdout_writer.flush(); // Don't forget to flush!
}

test "simple test" {
    const gpa = std.testing.allocator;
    var list: std.ArrayList(i32) = .empty;
    defer list.deinit(gpa);
    try list.append(gpa, 42);
    try std.testing.expectEqual(42, list.pop());
}
